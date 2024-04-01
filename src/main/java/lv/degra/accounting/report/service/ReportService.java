package lv.degra.accounting.report.service;

import lv.degra.accounting.document.dto.DocumentDto;
import lv.degra.accounting.report.model.ReportRepository;
import lv.degra.accounting.system.utils.NumberToWordUtil;
import lv.degra.accounting.system.utils.ReflectionUtil;
import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

import static lv.degra.accounting.system.configuration.DegraConfig.APPLICATION_TITLE;

@Service
public class ReportService {

    @Autowired
    private ReportRepository reportRepository;

    public JasperPrint getReportWithData(List<?> data, DocumentDto documentDto, String reportName, boolean printElectronicSign) {
        JasperPrint jasperPrint = null;
        try {

            //			Optional<Report> reportOptional = reportRepository.findByReportName(reportName);
            //			if (!reportOptional.isPresent()) {
            //				throw new Exception("Report not found with name: " + reportName);
            //			}
            //			byte[] reportContent = reportOptional.get().getReportContent();

            Path path = Paths.get("DegraReports/Bill.jrxml");
            byte[] reportContent = Files.readAllBytes(path);

            // Compile the Jasper report from .jrxml to .japser
            InputStream reportStream = new ByteArrayInputStream(reportContent);
            JasperReport report = JasperCompileManager.compileReport(reportStream);

            // Create the data source
            JRDataSource dataSource = new JRBeanCollectionDataSource(data);

            // Add parameters if any
            Map<String, Object> parameters = ReflectionUtil.convertObjectToMap(documentDto);
            parameters.put("documentTypeString", documentDto.getDocumentType().toString());
            parameters.put("sumTotalText", getSumWords(documentDto));
            parameters.put("printElectronicSign", printElectronicSign);
            parameters.put("version", APPLICATION_TITLE);


            // Fill the report
            jasperPrint = JasperFillManager.fillReport(report, parameters, dataSource);

        } catch (Exception e) {
            e.printStackTrace();
            // Handle exceptions appropriately in your application
        }
        return jasperPrint;
    }

    private String getSumWords(DocumentDto documentDto) {
        return NumberToWordUtil.getWordsFromDouble(
                documentDto.getSumTotal(), documentDto.getCurrency().getCurrencyCode()
        );
    }

}