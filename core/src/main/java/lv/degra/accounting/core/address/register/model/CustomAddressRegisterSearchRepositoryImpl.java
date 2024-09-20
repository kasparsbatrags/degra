package lv.degra.accounting.core.address.register.model;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;

@Repository
public class CustomAddressRegisterSearchRepositoryImpl implements CustomAddressRegisterSearchRepository {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public List<AddressRegister> searchByMultipleWords(String searchString) {
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
