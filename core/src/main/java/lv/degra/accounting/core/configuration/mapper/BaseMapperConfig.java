package lv.degra.accounting.core.configuration.mapper;

import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.Conditions;
import org.modelmapper.ModelMapper;
import org.modelmapper.PropertyMap;
import org.modelmapper.convention.MatchingStrategies;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import lv.degra.accounting.core.account.posted.dto.AccountPostedDto;
import lv.degra.accounting.core.account.posted.model.AccountPosted;
import lv.degra.accounting.core.document.dto.DocumentDto;
import lv.degra.accounting.core.document.model.Document;

@Configuration
public class BaseMapperConfig {
	@Bean
	public ModelMapper modelMapper() {
		ModelMapper modelMapper = new ModelMapper();
		modelMapper.getConfiguration()
				.setMatchingStrategy(MatchingStrategies.STRICT)
				.setPropertyCondition(Conditions.isNotNull());

		// Kartēšana no DocumentDto uz Document
		modelMapper.addMappings(new PropertyMap<DocumentDto, Document>() {
			@Override
			protected void configure() {
				using(ctx -> {
					List<AccountPostedDto> sourceList = (List<AccountPostedDto>) ctx.getSource();
					List<AccountPosted> destinationList = (List<AccountPosted>) ctx.getDestination();

					// Saglabāt sākotnējo atsauci, attīrīt un pievienot jaunos elementus
					if (destinationList != null) {
						destinationList.clear();
						destinationList.addAll(
								sourceList.stream()
										.map(dto -> {
											AccountPosted entity = modelMapper().map(dto, AccountPosted.class);
											entity.setDocument((Document) ctx.getParent().getDestination());
											return entity;
										})
										.collect(Collectors.toList())
						);
					}
					return destinationList;
				}).map(source.getAccountPostedList(), destination.getAccountPostedList());
			}
		});


		// Kartēšana no Document uz DocumentDto
		modelMapper.addMappings(new PropertyMap<Document, DocumentDto>() {
			@Override
			protected void configure() {
				using(ctx -> ((java.util.List<AccountPosted>) ctx.getSource()).stream()
						.map(entity -> {
							AccountPostedDto dto = modelMapper().map(entity, AccountPostedDto.class);
							// Iestatīt atsauci uz DocumentDto
							dto.setDocumentDto((DocumentDto) ctx.getParent().getDestination());
							return dto;
						})
						.collect(Collectors.toList()))
						.map(source.getAccountPostedList(), destination.getAccountPostedList());
			}
		});

		return modelMapper;
	}
}
