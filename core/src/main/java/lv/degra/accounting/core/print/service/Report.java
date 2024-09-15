package lv.degra.accounting.core.print.service;

import net.sf.jasperreports.engine.JasperFillManager;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.JasperReport;
import net.sf.jasperreports.engine.util.JRLoader;
import net.sf.jasperreports.view.JasperViewer;

import javax.sql.DataSource;
import java.io.InputStream;
import java.util.Map;

public abstract class Report {

    private static JasperViewer jviewer;
    private final DataSource dataSource;
    private JasperReport jreport;
    private JasperPrint jprint;

    public Report(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public void showReport() {
        jviewer = new JasperViewer(jprint, false);
        jviewer.setVisible(true);
    }

    public void createReport(Map<String, Object> map, InputStream by) {
        try {
            jreport = (JasperReport) JRLoader.loadObject(by);
            jprint = JasperFillManager.fillReport(jreport, map, dataSource.getConnection());

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

}
