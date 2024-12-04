package lv.degra.accounting.core.print.service;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.sql.Connection;
import java.util.HashMap;
import java.util.Map;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;
import lv.degra.accounting.core.report.model.ReportRepository;
import net.sf.jasperreports.engine.JasperFillManager;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.JasperReport;
import net.sf.jasperreports.engine.util.JRLoader;
import net.sf.jasperreports.view.JasperViewer;

@Service
@Slf4j
public class PrintServiceImpl implements PrintService {

	private final ReportRepository reportRepository;
	private final DataSource dataSource;

	@Autowired
	public PrintServiceImpl(ReportRepository reportRepository, DataSource dataSource) {
		this.reportRepository = reportRepository;
		this.dataSource = dataSource;
	}

	@Override
	public void showReport(JasperPrint jprint) {
		JasperViewer jviewer = new JasperViewer(jprint, false);
		jviewer.setVisible(true);
	}

	@Override
	public JasperPrint getReport(String reportName) {
		try (InputStream reportContent = new ByteArrayInputStream(
				reportRepository.findById(1L).orElseThrow(() -> new IllegalArgumentException("Report not found")).getReportContent())) {

			Map<String, Object> parameters = new HashMap<>();
			return buildReport(parameters, reportContent);
		} catch (IllegalArgumentException e) {
			log.error("Report not found: {}", reportName, e);
			throw e;
		} catch (Exception e) {
			log.error("Failed to generate report: {}", reportName, e);
			throw new IllegalArgumentException("Failed to generate report", e);
		}
	}


	public JasperPrint buildReport(Map<String, Object> parameters, InputStream reportStream) {
		try (Connection connection = dataSource.getConnection()) {
			JasperReport jreport = (JasperReport) JRLoader.loadObject(reportStream);
			return JasperFillManager.fillReport(jreport, parameters, connection);
		} catch (Exception e) {
			log.error("Error building report", e);
			throw new IllegalArgumentException("Error building report", e);
		}
	}
}
