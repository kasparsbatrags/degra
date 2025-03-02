package lv.degra.accounting.core.utils;

import java.util.List;

import org.springframework.security.access.AccessDeniedException;
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
    
    /**
     * Iegūst lietotāja grupas no JWT token
     * 
     * @return List<String> lietotāja grupas
     */
    public static List<String> getCurrentUserGroups() {
        Jwt jwt = (Jwt) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return jwt.getClaimAsStringList("groups");
    }
    
    /**
     * Pārbauda vai lietotājam ir norādītā grupa
     * 
     * @param groupName grupas nosaukums
     * @return boolean true, ja lietotājam ir norādītā grupa
     */
    public static boolean hasGroup(String groupName) {
        List<String> groups = getCurrentUserGroups();
        return groups != null && groups.contains(groupName);
    }
    
    /**
     * Pārbauda vai lietotājam ir visas norādītās grupas
     * 
     * @param groupNames grupas nosaukumi
     * @return boolean true, ja lietotājam ir visas norādītās grupas
     */
    public static boolean hasAllGroups(String... groupNames) {
        List<String> groups = getCurrentUserGroups();
        if (groups == null) {
            return false;
        }
        
        for (String groupName : groupNames) {
            if (!groups.contains(groupName)) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Pārbauda vai lietotājam ir vismaz viena no norādītajām grupām
     * 
     * @param groupNames grupas nosaukumi
     * @return boolean true, ja lietotājam ir vismaz viena no norādītajām grupām
     */
    public static boolean hasAnyGroup(String... groupNames) {
        List<String> groups = getCurrentUserGroups();
        if (groups == null) {
            return false;
        }
        
        for (String groupName : groupNames) {
            if (groups.contains(groupName)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Pārbauda vai lietotājam ir visas norādītās grupas, ja nav, tad izmet AccessDeniedException
     * 
     * @param groupNames grupas nosaukumi
     * @throws AccessDeniedException ja lietotājam nav visas norādītās grupas
     */
    public static void requireAllGroups(String... groupNames) {
        if (!hasAllGroups(groupNames)) {
            throw new AccessDeniedException("User must have all required groups: " + String.join(", ", groupNames));
        }
    }
    
    /**
     * Pārbauda vai lietotājam ir vismaz viena no norādītajām grupām, ja nav, tad izmet AccessDeniedException
     * 
     * @param groupNames grupas nosaukumi
     * @throws AccessDeniedException ja lietotājam nav vismaz viena no norādītajām grupām
     */
    public static void requireAnyGroup(String... groupNames) {
        if (!hasAnyGroup(groupNames)) {
            throw new AccessDeniedException("User must have at least one of the required groups: " + String.join(", ", groupNames));
        }
    }
}
