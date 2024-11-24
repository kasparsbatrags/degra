package lv.degra.accounting.core.account.posted.service;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lv.degra.accounting.core.account.posted.model.AccountPostedRepository;

@Service
public class AccountPostedServiceImpl implements AccountPostedService {

	private final AccountPostedRepository accountPostedRepository;
	private final ModelMapper modelMapper;

	@Autowired
	public AccountPostedServiceImpl(AccountPostedRepository accountPostedRepository, ModelMapper modelMapper) {
		this.accountPostedRepository = accountPostedRepository;
        this.modelMapper = modelMapper;
    }

}
