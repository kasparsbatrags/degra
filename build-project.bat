set JAVA_HOME=C:\Users\Kaspars\.jdks\azul-21.0.6
cd core
mvn clean install -DskipTests
cd ..
cd company
mvn clean install -DskipTests
