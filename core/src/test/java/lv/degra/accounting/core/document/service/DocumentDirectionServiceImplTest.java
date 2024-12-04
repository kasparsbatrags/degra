package lv.degra.accounting.core.document.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.Sort;

import lv.degra.accounting.core.document.model.DocumentDirection;
import lv.degra.accounting.core.document.model.DocumentDirectionRepository;

class DocumentDirectionServiceImplTest {

	@Mock
	private DocumentDirectionRepository documentDirectionRepository;

	@InjectMocks
	private DocumentDirectionServiceImpl documentDirectionService;

	@BeforeEach
	void setUp() {
		MockitoAnnotations.openMocks(this);
	}

	@Test
	void testGetDocumentDirectionList() {
		// Arrange
		DocumentDirection dir1 = new DocumentDirection();
		dir1.setId(1);
		dir1.setName("Direction 1");

		DocumentDirection dir2 = new DocumentDirection();
		dir2.setId(2);
		dir2.setName("Direction 2");

		List<DocumentDirection> directions = Arrays.asList(dir1, dir2);

		when(documentDirectionRepository.findAll(Sort.by(Sort.Direction.ASC, "id"))).thenReturn(directions);

		// Act
		List<DocumentDirection> result = documentDirectionService.getDocumentDirectionList();

		// Assert
		assertEquals(2, result.size());
		assertEquals("Direction 1", result.get(0).getName());
		assertEquals("Direction 2", result.get(1).getName());
		verify(documentDirectionRepository, times(1)).findAll(Sort.by(Sort.Direction.ASC, "id"));
	}
}
