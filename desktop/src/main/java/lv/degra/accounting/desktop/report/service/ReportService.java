package lv.degra.accounting.desktop.report.service;

import static lv.degra.accounting.desktop.system.configuration.DegraDesktopConfig.APPLICATION_TITLE;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;
import lv.degra.accounting.core.document.dto.DocumentDto;
import lv.degra.accounting.core.system.utils.NumberToWordUtil;
import lv.degra.accounting.core.system.utils.ReflectionUtil;
import net.sf.jasperreports.engine.JRDataSource;
import net.sf.jasperreports.engine.JasperCompileManager;
import net.sf.jasperreports.engine.JasperFillManager;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.JasperReport;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;

@Service
@Slf4j
public class ReportService {

	private static final Path REPORT_PATH = Paths.get("DegraReports/Bill.jrxml");

	public JasperPrint getReportWithData(List<?> data, DocumentDto documentDto, boolean printElectronicSign) {
		try {
			byte[] reportContent = readReportContent();
			InputStream reportStream = new ByteArrayInputStream(reportContent);
			JasperReport report = JasperCompileManager.compileReport(reportStream);

			JRDataSource dataSource = new JRBeanCollectionDataSource(data);

			Map<String, Object> parameters = prepareParameters(documentDto, printElectronicSign);

			return JasperFillManager.fillReport(report, parameters, dataSource);
		} catch (Exception e) {
			log.error("Error generating report: ", e);
			return null;
		}
	}

	private byte[] readReportContent() throws IOException {
		return Files.readAllBytes(REPORT_PATH);
	}

	private Map<String, Object> prepareParameters(DocumentDto documentDto, boolean printElectronicSign) {
		Map<String, Object> parameters = ReflectionUtil.convertObjectToMap(documentDto);
		parameters.put("documentTypeString", documentDto.getDocumentSubType().toString());
		parameters.put("sumTotalText", getSumWords(documentDto));
		parameters.put("printElectronicSign", printElectronicSign);
		parameters.put("version", APPLICATION_TITLE);
		return parameters;
	}

	private String getSumWords(DocumentDto documentDto) {
		return NumberToWordUtil.getWordsFromDouble(documentDto.getSumTotal(), documentDto.getCurrency().getCurrencyCode());
	}
}
