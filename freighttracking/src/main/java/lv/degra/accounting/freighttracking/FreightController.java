package lv.degra.accounting.freighttracking;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/freight")
public class FreightController {

	@GetMapping("/user")
	@PreAuthorize("hasAuthority('USER')")
	public String getFreightData() {
		return "Protected Freight Data";
	}


	@GetMapping("/public")
	public String getFreightPublicData() {
		return "Public Freight Data";
	}


}
