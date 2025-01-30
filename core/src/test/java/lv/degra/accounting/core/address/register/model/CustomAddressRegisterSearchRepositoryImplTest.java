package lv.degra.accounting.core.address.register.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;

class CustomAddressRegisterSearchRepositoryImplTest {

	private CustomAddressRegisterSearchRepositoryImpl repository;

	@Mock
	private EntityManager entityManager;

	@Mock
	private CriteriaBuilder criteriaBuilder;

	@Mock
	private CriteriaQuery<AddressRegister> criteriaQuery;

	@Mock
	private Root<AddressRegister> root;

	@BeforeEach
	void setUp() {
		MockitoAnnotations.openMocks(this);
		repository = new CustomAddressRegisterSearchRepositoryImpl();
		repository.entityManager = entityManager;

		when(entityManager.getCriteriaBuilder()).thenReturn(criteriaBuilder);
		when(criteriaBuilder.createQuery(AddressRegister.class)).thenReturn(criteriaQuery);
		when(criteriaQuery.from(AddressRegister.class)).thenReturn(root);
	}

	@Test
	void testSearchByMultipleWords_SingleWord() {
		String searchString = "Test";
		Predicate mockPredicate = mock(Predicate.class);

		when(criteriaBuilder.like(any(), eq("%test%"))).thenReturn(mockPredicate);
		when(criteriaBuilder.and(mockPredicate)).thenReturn(mockPredicate);
		when(criteriaQuery.select(root)).thenReturn(criteriaQuery);
		when(criteriaQuery.where(mockPredicate)).thenReturn(criteriaQuery);

		TypedQuery<AddressRegister> mockTypedQuery = mock(TypedQuery.class);
		when(mockTypedQuery.setMaxResults(20)).thenReturn(mockTypedQuery);
		List<AddressRegister> mockResults = List.of(mock(AddressRegister.class));
		when(mockTypedQuery.getResultList()).thenReturn(mockResults);

		when(entityManager.createQuery(criteriaQuery)).thenReturn(mockTypedQuery);

		List<AddressRegister> result = repository.searchByMultipleWords(searchString);

		assertEquals(mockResults, result);
		verify(criteriaBuilder).like(any(), eq("%test%"));
		verify(entityManager).createQuery(criteriaQuery);
		verify(mockTypedQuery).setMaxResults(20);
		verify(mockTypedQuery).getResultList();
	}


	@Test
	void testSearchByMultipleWords_MultipleWords() {
		String searchString = "Test Address";
		Predicate predicate1 = mock(Predicate.class);
		Predicate predicate2 = mock(Predicate.class);
		when(criteriaBuilder.like(any(), eq("%test%"))).thenReturn(predicate1);
		when(criteriaBuilder.like(any(), eq("%address%"))).thenReturn(predicate2);

		when(criteriaBuilder.and(predicate1, predicate2)).thenReturn(predicate1);
		when(criteriaQuery.select(root)).thenReturn(criteriaQuery);
		when(criteriaQuery.where(predicate1)).thenReturn(criteriaQuery);

		TypedQuery<AddressRegister> mockTypedQuery = mock(TypedQuery.class);
		when(mockTypedQuery.setMaxResults(20)).thenReturn(mockTypedQuery);
		List<AddressRegister> mockResults = List.of(mock(AddressRegister.class), mock(AddressRegister.class));
		when(mockTypedQuery.getResultList()).thenReturn(mockResults);

		when(entityManager.createQuery(criteriaQuery)).thenReturn(mockTypedQuery);

		List<AddressRegister> result = repository.searchByMultipleWords(searchString);

		assertEquals(mockResults, result);
		verify(criteriaBuilder).like(any(), eq("%test%"));
		verify(criteriaBuilder).like(any(), eq("%address%"));
		verify(entityManager).createQuery(criteriaQuery);
		verify(mockTypedQuery).setMaxResults(20);
		verify(mockTypedQuery).getResultList();
	}

	@Test
	void testSearchByMultipleWords_NoResults() {
		String searchString = "NonExistingWord";
		Predicate mockPredicate = mock(Predicate.class);

		when(criteriaBuilder.like(any(), eq("%nonexistingword%"))).thenReturn(mockPredicate);
		when(criteriaBuilder.and(mockPredicate)).thenReturn(mockPredicate);
		when(criteriaQuery.select(root)).thenReturn(criteriaQuery);
		when(criteriaQuery.where(mockPredicate)).thenReturn(criteriaQuery);

		TypedQuery<AddressRegister> mockTypedQuery = mock(TypedQuery.class);
		when(mockTypedQuery.setMaxResults(20)).thenReturn(mockTypedQuery); // Simulē setMaxResults
		when(mockTypedQuery.getResultList()).thenReturn(new ArrayList<>()); // Atgriež tukšu sarakstu

		when(entityManager.createQuery(criteriaQuery)).thenReturn(mockTypedQuery); // Simulē createQuery

		List<AddressRegister> result = repository.searchByMultipleWords(searchString);

		assertEquals(0, result.size());

		verify(entityManager).createQuery(criteriaQuery);
	}


	@Test
	void testSearchByMultipleWords_EmptyString() {
		String searchString = "";

		List<AddressRegister> result = repository.searchByMultipleWords(searchString);

		assertEquals(0, result.size());
		verify(entityManager, never()).createQuery(any(CriteriaQuery.class));
	}

}
