package lv.degra.accounting.report.model;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReportRepository extends JpaRepository<Report, Long> {

	@Query(value = "SELECT r FROM Report r WHERE r.reportName = :reportName")
	Optional<Report> findByReportName(@Param("reportName") String reportName);
}
