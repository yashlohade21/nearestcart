package com.nearkart.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

@Service
public class OtpService {

    private final String otpSecret;
    private final boolean devMode;
    private final String devOtp;

    public OtpService(
            @Value("${app.otp.secret}") String otpSecret,
            @Value("${app.otp.dev-mode}") boolean devMode,
            @Value("${app.otp.dev-otp}") String devOtp) {
        this.otpSecret = otpSecret;
        this.devMode = devMode;
        this.devOtp = devOtp;
    }

    public String generateOtp(String phone) {
        long timeStep = System.currentTimeMillis() / 1000 / 300; // 5-minute window
        String msg = phone + ":" + timeStep;
        String hex = hmacSha256(msg);
        long num = Long.parseLong(hex.substring(0, 8), 16) % 1000000;
        return String.format("%06d", num);
    }

    public boolean verifyOtp(String phone, String otp) {
        if (devMode) {
            return devOtp.equals(otp);
        }
        String current = generateOtp(phone);
        if (current.equals(otp)) return true;

        // Check previous window
        long timeStep = System.currentTimeMillis() / 1000 / 300 - 1;
        String msg = phone + ":" + timeStep;
        String hex = hmacSha256(msg);
        long num = Long.parseLong(hex.substring(0, 8), 16) % 1000000;
        String previous = String.format("%06d", num);
        return previous.equals(otp);
    }

    public String sendOtp(String phone) {
        if (devMode) {
            return devOtp;
        }
        return generateOtp(phone);
    }

    private String hmacSha256(String message) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec keySpec = new SecretKeySpec(
                    otpSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(keySpec);
            byte[] hash = mac.doFinal(message.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("HMAC-SHA256 failed", e);
        }
    }
}
