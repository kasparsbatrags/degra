package lv.degra.accounting.core.print.service;

import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.JasperReport;

public interface PrintService {
	JasperPrint getReport(String reportName);

	void showReport(JasperPrint report);
}
