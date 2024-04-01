package lv.degra.accounting.print.service;

import java.io.InputStream;
import java.sql.Connection;
import java.util.Map;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

import net.sf.jasperreports.engine.JasperFillManager;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.JasperReport;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import net.sf.jasperreports.engine.util.JRLoader;
import net.sf.jasperreports.view.JasperViewer;

public abstract class Report {


	@Autowired
	private DataSource dataSource;
	private static JasperReport jreport;
	private static JasperViewer jviewer;
	private static JasperPrint jprint;

	public void createReport(Map<String, Object> map, InputStream by) {
		try {
//			JRBeanCollectionDataSource source = new JRBeanCollectionDataSource();
//			DriverManagerDataSource dataSource = new DriverManagerDataSource();
			jreport = (JasperReport)JRLoader.loadObject(by);
			jprint = JasperFillManager.fillReport(jreport, map, dataSource.getConnection());
			
		}catch(Exception e) {
			e.printStackTrace();
		}
	}

	public static void showReport() {
		jviewer = new JasperViewer(jprint, false); // false to avoid closing the main application and will only close the print preview
		jviewer.setVisible(true);
	}
	
	
}
