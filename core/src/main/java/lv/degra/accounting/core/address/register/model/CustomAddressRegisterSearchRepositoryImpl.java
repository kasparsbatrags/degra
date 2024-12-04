package lv.degra.accounting.core.address.register.model;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;

@Repository
public class CustomAddressRegisterSearchRepositoryImpl implements CustomAddressRegisterSearchRepository {

    @PersistenceContext
    EntityManager entityManager;

	@Override
	public List<AddressRegister> searchByMultipleWords(String searchString) {
		if (searchString == null || searchString.isBlank()) {
			return new ArrayList<>();
		}

		String[] words = searchString.replace(",", "").split(" ");
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<AddressRegister> query = cb.createQuery(AddressRegister.class);
		Root<AddressRegister> root = query.from(AddressRegister.class);

		List<Predicate> predicates = new ArrayList<>();
		for (String word : words) {
			predicates.add(cb.like(cb.lower(root.get("fullAddress")), "%" + word.toLowerCase() + "%"));
		}

		query.select(root).where(cb.and(predicates.toArray(new Predicate[0])));

		return entityManager.createQuery(query).setMaxResults(20).getResultList();
	}

}
