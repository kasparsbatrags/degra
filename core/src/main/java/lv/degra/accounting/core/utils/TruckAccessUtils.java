package lv.degra.accounting.core.utils;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

import static lv.degra.accounting.core.config.ApiConstants.USER_MANAGER_ROLE_NAME;
import static lv.degra.accounting.core.config.ApiConstants.USER_ROLE_NAME;
import lv.degra.accounting.core.truck_user_map.model.TruckUserMapRepository;
import lv.degra.accounting.core.user.model.User;

/**
 * Utilīšu klase kravas auto piekļuves pārbaudēm
 */
@Component
public class TruckAccessUtils {
    
    /**
     * Pārbauda lietotāja piekļuves tiesības kravas auto
     * 
     * @param truckId kravas auto ID
     * @param user lietotājs
     * @param truckUserMapRepository repozitorijs kravas auto-lietotāju saistībām
     * @throws AccessDeniedException ja lietotājam nav piekļuves tiesību
     */
    public static void validateUserAccessToTruck(String truckId, User user, TruckUserMapRepository truckUserMapRepository) {
        if (UserContextUtils.hasGroup(USER_MANAGER_ROLE_NAME)) {
            return;
        }
        
        if (!UserContextUtils.hasGroup(USER_ROLE_NAME)) {
            throw new AccessDeniedException("User must have USER role to edit truck routes");
        }
        
        boolean hasTruckAssociation = truckUserMapRepository.findByUser(user).stream()
                .anyMatch(mapping -> mapping.getTruck().getUid().equals(truckId));
        
        if (!hasTruckAssociation) {
            throw new AccessDeniedException("User does not have access to this truck");
        }
    }
}
