package lv.degra.accounting.desktop.report.service;

import static lv.degra.accounting.desktop.system.configuration.DegraDesktopConfig.APPLICATION_TITLE;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
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

	@Autowired
	public ReportService() {
	}

	public JasperPrint getReportWithData(List<?> data, DocumentDto documentDto, boolean printElectronicSign) {
		JasperPrint jasperPrint = null;
		try {

			Path path = Paths.get("DegraReports/Bill.jrxml");
			byte[] reportContent = Files.readAllBytes(path);

			InputStream reportStream = new ByteArrayInputStream(reportContent);
			JasperReport report = JasperCompileManager.compileReport(reportStream);

			JRDataSource dataSource = new JRBeanCollectionDataSource(data);

			Map<String, Object> parameters = ReflectionUtil.convertObjectToMap(documentDto);
			parameters.put("documentTypeString", documentDto.getDocumentSubType().toString());
			parameters.put("sumTotalText", getSumWords(documentDto));
			parameters.put("printElectronicSign", printElectronicSign);
			parameters.put("version", APPLICATION_TITLE);

			jasperPrint = JasperFillManager.fillReport(report, parameters, dataSource);

		} catch (Exception e) {
			log.error(e.toString());
		}
		return jasperPrint;
	}

	private String getSumWords(DocumentDto documentDto) {
		return NumberToWordUtil.getWordsFromDouble(documentDto.getSumTotal(), documentDto.getCurrency().getCurrencyCode());
	}

}