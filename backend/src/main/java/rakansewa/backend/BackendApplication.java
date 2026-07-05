package rakansewa.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		loadEnv();
		SpringApplication.run(BackendApplication.class, args);
	}

	static void loadEnv() {
		String[] paths = {".env", "backend/.env"};
		for (String path : paths) {
			if (Files.exists(Paths.get(path))) {
				try {
					List<String> lines = Files.readAllLines(Paths.get(path));
					for (String line : lines) {
						line = line.trim();
						if (line.isEmpty() || line.startsWith("#")) {
							continue;
						}
						int eqIndex = line.indexOf('=');
						if (eqIndex > 0) {
							String key = line.substring(0, eqIndex).trim();
							String value = line.substring(eqIndex + 1).trim();
							if (value.startsWith("\"") && value.endsWith("\"") && value.length() > 1) {
								value = value.substring(1, value.length() - 1);
							} else if (value.startsWith("'") && value.endsWith("'") && value.length() > 1) {
								value = value.substring(1, value.length() - 1);
							}
							if (System.getProperty(key) == null && System.getenv(key) == null) {
								System.setProperty(key, value);
							}
						}
					}
					System.out.println("Loaded environment variables from " + path);
					break;
				} catch (IOException e) {
					System.err.println("Failed to read " + path + ": " + e.getMessage());
				}
			}
		}
	}

}

