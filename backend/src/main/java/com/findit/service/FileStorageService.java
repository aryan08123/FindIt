package com.findit.service;

import com.findit.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

/** Saves, validates and deletes uploaded item images on the local disk. */
@Service
public class FileStorageService {

    private static final long MAX_SIZE_BYTES = 5L * 1024 * 1024;
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png");
    private static final String URL_PREFIX = "/uploads/";

    private final Path root;

    public FileStorageService(@Value("${app.upload.dir}") String uploadDir) {
        this.root = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(root);
        } catch (IOException e) {
            throw new IllegalStateException("Could not create upload directory: " + root, e);
        }
    }

    /**
     * Validates and stores the image. Returns the public path (e.g.
     * /uploads/abc.png) or null if no file.
     */
    public String store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }
        if (file.getSize() > MAX_SIZE_BYTES) {
            throw new BadRequestException("Image is too large (maximum 5 MB)");
        }

        String original = StringUtils.cleanPath(file.getOriginalFilename() == null ? "" : file.getOriginalFilename());
        String ext = extensionOf(original);
        if (!ALLOWED_EXTENSIONS.contains(ext)) {
            throw new BadRequestException("Only JPG, JPEG and PNG images are allowed");
        }

        // Check the real file content, so a renamed text/exe file is rejected
        byte[] head;
        try (InputStream in = file.getInputStream()) {
            head = in.readNBytes(8);
        } catch (IOException e) {
            throw new IllegalStateException("Could not read the uploaded file", e);
        }
        boolean isPng = head.length >= 8
                && (head[0] & 0xFF) == 0x89 && head[1] == 0x50 && head[2] == 0x4E && head[3] == 0x47
                && head[4] == 0x0D && head[5] == 0x0A && head[6] == 0x1A && head[7] == 0x0A;
        boolean isJpeg = head.length >= 3
                && (head[0] & 0xFF) == 0xFF && (head[1] & 0xFF) == 0xD8 && (head[2] & 0xFF) == 0xFF;
        boolean matches = ext.equals("png") ? isPng : isJpeg;
        if (!matches) {
            throw new BadRequestException("The file content is not a valid " + ext.toUpperCase() + " image");
        }

        // Random server-side name: the original name is never used on disk
        String filename = UUID.randomUUID() + "." + (ext.equals("png") ? "png" : "jpg");
        Path target = root.resolve(filename).normalize();
        if (!root.equals(target.getParent())) {
            throw new BadRequestException("Invalid file name");
        }
        try (InputStream in = file.getInputStream()) {
            Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new IllegalStateException("Could not store the image", e);
        }
        return URL_PREFIX + filename;
    }

    /**
     * Deletes a previously stored image. Silently ignores null, unknown or unsafe
     * paths.
     */
    public void delete(String imageUrl) {
        if (imageUrl == null || !imageUrl.startsWith(URL_PREFIX)) {
            return;
        }
        Path target = root.resolve(imageUrl.substring(URL_PREFIX.length())).normalize();
        if (!root.equals(target.getParent())) {
            return;
        }
        try {
            Files.deleteIfExists(target);
        } catch (IOException ignored) {
            // A leftover file is harmless; do not fail the request because of it
        }
    }

    private String extensionOf(String filename) {
        int dot = filename.lastIndexOf('.');
        return dot < 0 ? "" : filename.substring(dot + 1).toLowerCase();
    }
}



