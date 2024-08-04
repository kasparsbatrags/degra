package lv.degra.accounting.core.print.service;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lv.degra.accounting.core.report.model.ReportRepository;
import net.sf.jasperreports.engine.JasperExportManager;
import net.sf.jasperreports.engine.JasperFillManager;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.JasperReport;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import net.sf.jasperreports.engine.util.JRLoader;
import net.sf.jasperreports.view.JasperViewer;

@Service
public class PrintServiceImpl implements PrintService {

//	private static JasperReport jreport;
	//private static JasperViewer jviewer;
//	private static JasperPrint jprint;
	@Autowired
	private ReportRepository reportRepository;
	@Autowired
	private DataSource dataSource;

	public void showReport(JasperPrint jprint) {
		JasperViewer jviewer = new JasperViewer(jprint, false); // false to avoid closing the main application and will only close the print preview
		jviewer.setVisible(true);
	}

	public JasperPrint getReport(String reportName) {

		InputStream reportContent = new ByteArrayInputStream(reportRepository.findById(1L).get().getReportContent());
		Map<String, Object> map = new HashMap<String, Object>();
		JasperPrint report = buildReport(map, reportContent);
		return report;
	}

	public JasperPrint buildReport(Map<String, Object> map, InputStream by) {
		JasperPrint jprint = null;
		JasperReport jreport;
		try {
			//			JRBeanCollectionDataSource source = new JRBeanCollectionDataSource();
			//			DriverManagerDataSource dataSource = new DriverManagerDataSource();
			jreport = (JasperReport) JRLoader.loadObject(by);
			jprint = JasperFillManager.fillReport(jreport, map, dataSource.getConnection());

		} catch (Exception e) {
			e.printStackTrace();
		}
		return jprint;
	}


	public void generateReport(List<?> dataSource, Map<String, Object> parameters, String reportPath, String outputPath) {
		try {
			JRBeanCollectionDataSource beanCollectionDataSource = new JRBeanCollectionDataSource(dataSource);
			JasperPrint jasperPrint = JasperFillManager.fillReport(reportPath, parameters, beanCollectionDataSource);

			// Export to PDF
			JasperExportManager.exportReportToPdfFile(jasperPrint, outputPath);

			// Here, you could also implement logic to automatically open the PDF with the default system viewer,
			// or provide the file through a web interface for download.
		} catch (Exception e) {
			e.printStackTrace();
			// Handle exceptions appropriately
		}
	}

}
