package lv.degra.accounting.address.config;

import lv.degra.accounting.core.address.model.Address;
import lv.degra.accounting.core.address.register.model.AddressRegister;
import lv.degra.accounting.core.address.register.model.AddressRegisterRepository;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.batch.item.ItemWriter;
import org.springframework.batch.item.data.RepositoryItemReader;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.Sort;
import org.springframework.transaction.PlatformTransactionManager;

import java.util.Collections;

@Configuration
public class BatchConfig {

    private final JobRepository jobRepository;
    private final PlatformTransactionManager transactionManager;

    public BatchConfig(JobRepository jobRepository, PlatformTransactionManager transactionManager) {
        this.jobRepository = jobRepository;
        this.transactionManager = transactionManager;
    }

    @Bean
    public Job updateAddressJob(Step step1) {
        return new JobBuilder("updateAddressJob", jobRepository)
                .start(step1)
                .build();
    }

    @Bean
    public Step step1(RepositoryItemReader<AddressRegister> reader,
                      ItemProcessor<AddressRegister, Address> processor,
                      ItemWriter<Address> writer) {
        return new StepBuilder("step1", jobRepository)
                .<AddressRegister, Address>chunk(1000, transactionManager)
                .reader(reader)
                .processor(processor)
                .writer(writer)
                .build();
    }

    @Bean
    public RepositoryItemReader<AddressRegister> reader(AddressRegisterRepository addressRegisterRepository) {
        RepositoryItemReader<AddressRegister> reader = new RepositoryItemReader<>();
        reader.setRepository(addressRegisterRepository);
        reader.setMethodName("findAll");
        reader.setPageSize(5000);
        reader.setSort(Collections.singletonMap("id", Sort.Direction.ASC));
        return reader;
    }
}
