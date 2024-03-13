package lv.degra.accounting.report.service;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lv.degra.accounting.document.dto.DocumentDto;
import lv.degra.accounting.report.model.ReportRepository;
import lv.degra.accounting.system.utils.ReflectionUtil;
import net.sf.jasperreports.engine.JRDataSource;
import net.sf.jasperreports.engine.JasperCompileManager;
import net.sf.jasperreports.engine.JasperFillManager;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.JasperReport;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;

@Service
public class ReportService {

	@Autowired
	private ReportRepository reportRepository;

	public JasperPrint getReportWithData(List<?> data, DocumentDto documentDto, String reportName) {
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



			// Fill the report
			jasperPrint = JasperFillManager.fillReport(report, parameters, dataSource);

		} catch (Exception e) {
			e.printStackTrace();
			// Handle exceptions appropriately in your application
		}
		return jasperPrint;
	}

}