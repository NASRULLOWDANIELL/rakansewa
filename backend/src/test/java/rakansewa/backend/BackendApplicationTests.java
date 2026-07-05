package rakansewa.backend;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.core.env.Environment;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class BackendApplicationTests {

	static {
		BackendApplication.loadEnv();
	}

	@Autowired
	private Environment environment;

	@Test
	void contextLoads() {
		assertNotNull(environment);
	}

	@Test
	void testEnvLoading() {
		String mailHost = environment.getProperty("spring.mail.host");
		String mailPort = environment.getProperty("spring.mail.port");
		String mailAuth = environment.getProperty("spring.mail.properties.mail.smtp.auth");

		assertNotNull(mailHost, "Mail host should not be null");
		assertNotNull(mailPort, "Mail port should not be null");
		assertEquals("true", mailAuth, "Mail auth should be true");
	}
}

