package lv.degra.accounting.keycloak.listener;

import org.keycloak.events.Event;
import org.keycloak.events.EventListenerProvider;
import org.keycloak.events.admin.AdminEvent;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.RealmModel;
import org.keycloak.models.RoleModel;
import org.keycloak.models.UserModel;

public class EmailVerifiedListenerProvider implements EventListenerProvider {

    private final KeycloakSession session;

    public EmailVerifiedListenerProvider(KeycloakSession session) {
        this.session = session;
    }

    @Override
    public void onEvent(Event event) {
        if (event.getType().toString().equals("VERIFY_EMAIL")) {
            RealmModel realm = session.realms().getRealm(event.getRealmId());
            UserModel user = session.users().getUserById(realm, event.getUserId());

            RoleModel role = realm.getRole("USER");
            if (role != null && !user.hasRole(role)) {
                user.grantRole(role);
            }
        }
    }

	@Override
	public void onEvent(AdminEvent adminEvent, boolean b) {

	}

	@Override
    public void close() {}
}