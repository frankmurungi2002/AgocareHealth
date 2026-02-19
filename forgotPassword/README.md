Add these to application.properties

spring.application.name=agocare  
spring.mail.host=smtp.gmail.com  
spring.mail.port=587  
spring.mail.username=gdrums99@gmail.com  
spring.mail.password=hplc atmw sovu qwwi  
spring.mail.properties.mail.smtp.auth=true  
spring.mail.properties.mail.smtp.starttls.enable=true  




Add these to pom.xml or the xml file being used

<dependency>  
  <groupId>org.springframework.boot</groupId>  
  <artifactId>spring-boot-starter-mail</artifactId>  
</dependency>  
<dependency>  
  <groupId>org.springframework</groupId>  
  <artifactId>spring-context-support</artifactId>  
  <version>7.0.3</version>  
</dependency>  
