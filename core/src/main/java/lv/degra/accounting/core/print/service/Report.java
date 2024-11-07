package lv.degra.accounting.core.print.service;

import java.io.InputStream;
import java.util.Map;

import javax.sql.DataSource;

import net.sf.jasperreports.engine.JasperFillManager;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.JasperReport;
import net.sf.jasperreports.engine.util.JRLoader;
import net.sf.jasperreports.view.JasperViewer;

public abstract class Report {


    private final DataSource dataSource;
    protected JasperPrint jprint;

	protected Report(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public void showReport() {
		JasperViewer jviewer = new JasperViewer(jprint, false);
        jviewer.setVisible(true);
    }

    public void createReport(Map<String, Object> map, InputStream by) {
		JasperReport jreport = null;
        try {
            jreport = (JasperReport) JRLoader.loadObject(by);
            jprint = JasperFillManager.fillReport(jreport, map, dataSource.getConnection());

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

}
