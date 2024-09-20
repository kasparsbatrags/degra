package lv.degra.accounting.address.controller;

import io.swagger.v3.oas.annotations.Hidden;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobExecutionException;

@RestController
public class BatchJobController {

    @Autowired
    private JobLauncher jobLauncher;

    @Autowired
    private Job updateAddressJob;

    @Hidden
    @PostMapping("/run-batch-job")
    public String runBatchJob() {
        try {
            JobParameters params = new JobParametersBuilder()
                    .addLong("run.id", System.currentTimeMillis())
                    .toJobParameters();
            jobLauncher.run(updateAddressJob, params);
            return "Batch job started successfully!";
        } catch (JobExecutionException e) {
            return "Failed to start batch job: " + e.getMessage();
        }
    }
}
