# Getting Started

### Reference Documentation

For further reference, please consider the following sections:

* [Official Apache Maven documentation](https://maven.apache.org/guides/index.html)
* [Spring Boot Maven Plugin Reference Guide](https://docs.spring.io/spring-boot/3.4.0/maven-plugin)
* [Create an OCI image](https://docs.spring.io/spring-boot/3.4.0/maven-plugin/build-image.html)

### RUN project on docker with command 
cd ../degra

docker-compose -f usermanager/docker-compose.yml up -d

## Troubleshooting

### Keycloak Authentication Issue (401 Unauthorized)

If you encounter a 401 Unauthorized error when registering users, especially in the test environment, it's likely because the service account for the "freight-tracking-client" client doesn't have the necessary permissions to create users in Keycloak.

#### Solution:

1. Log in to the Keycloak admin console at https://app.degra.lv
2. Select the "degra-test-realm" realm
3. Go to "Clients" → "freight-tracking-client"
4. Click on the "Service Account Roles" tab
5. In the "Client Roles" dropdown, select "realm-management"
6. Add the following roles:
   - manage-users
   - view-users
   - query-users
   - view-realm

Alternatively, you can add the "realm-admin" role which includes all necessary permissions.

This will give the service account the necessary permissions to create users in the Keycloak realm, resolving the 401 Unauthorized error.

The configuration in your application-test.yaml should match:
```yaml
keycloak:
  auth-server-url: https://app.degra.lv
  realm: degra-test-realm
  resource: freight-tracking-client
  credentials:
    secret: LfJVcO6ArZHzxl0J9dsdjdQOYxxiki
```
