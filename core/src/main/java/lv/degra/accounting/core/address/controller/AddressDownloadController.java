package lv.degra.accounting.core.address.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lv.degra.accounting.core.address.service.DownloadAddressDataService;

@RestController
@RequestMapping(AddressDownloadController.ADDRESS_REGISTER)
public class AddressDownloadController {
	public static final String ADDRESS_REGISTER = "/API/address-register";
	public static final String DOWNLOAD = "/download";

	private final DownloadAddressDataService downloadAddressDataService;

	@Autowired
	public AddressDownloadController(DownloadAddressDataService downloadAddressDataService) {
		this.downloadAddressDataService = downloadAddressDataService;
	}

	@GetMapping(value = DOWNLOAD)
	public void downloadArData() {
		downloadAddressDataService.downloadArData();
	}

}
