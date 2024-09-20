package lv.degra.accounting.address.sheduler;

import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class BatchJobScheduler {

    @Autowired
    private JobLauncher jobLauncher;

    @Autowired
    private Job updateAddressJob;

    @Scheduled(cron = "0 5 20 * * ?")
    public void performBatchJob() throws Exception {
        jobLauncher.run(updateAddressJob, new JobParameters());
    }
}
