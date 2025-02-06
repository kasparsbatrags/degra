package lv.degra.accounting.core.utils;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import lv.degra.accounting.core.exception.InvalidRequestException;

@Component
public class UserContextUtils {
    
    /**
     * Iegūst lietotāja ID no JWT token
     * 
     * @return String lietotāja ID
     * @throws InvalidRequestException ja lietotāja ID nav atrasts vai ir nederīgs
     */
    public static String getCurrentUserId() {
        Jwt jwt = (Jwt) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String userId = jwt.getSubject();
        
        if (userId == null || userId.trim().isEmpty()) {
            throw new InvalidRequestException("Invalid user ID in token");
        }
        
        return userId;
    }
}
