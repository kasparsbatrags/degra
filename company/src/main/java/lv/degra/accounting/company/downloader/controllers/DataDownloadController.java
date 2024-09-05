package lv.degra.accounting.company.downloader.controllers;

import lv.degra.accounting.company.services.DownloadDataService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(DataDownloadController.COMPANY)
public class DataDownloadController {

    public static final String COMPANY = "/comapny";
    public static final String DOWNLOAD = "/download";

    private final DownloadDataService downloadDataService;

    public DataDownloadController(DownloadDataService downloadDataService) {
        this.downloadDataService = downloadDataService;
    }

    @GetMapping(DOWNLOAD)
    public void downloadData() {
        downloadDataService.downloadData();
    }

}
