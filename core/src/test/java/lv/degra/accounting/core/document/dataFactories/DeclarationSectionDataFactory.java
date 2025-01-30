package lv.degra.accounting.core.document.dataFactories;

import lv.degra.accounting.core.document.model.DeclarationSection;

public class DeclarationSectionDataFactory {

	public static DeclarationSection createValidSection1() {
		DeclarationSection section = new DeclarationSection();
		section.setId(1);
		section.setCode("PVN 1-I");
		section.setName("Nodokļa summas par iekšzemē iegādātajām precēm un saņemtajiem pakalpojumiem");
		return section;
	}

	public static DeclarationSection createValidSection2() {
		DeclarationSection section = new DeclarationSection();
		section.setId(2);
		section.setCode("PVN 1-II");
		section.setName("Nodokļa summas par precēm un pakalpojumiem, kas saņemti no Eiropas Savienības dalībvalstīm");
		return section;
	}

	public static DeclarationSection createSectionWithLongCode() {
		DeclarationSection section = createValidSection1();
		section.setCode("TOO_LONG_CODE"); // Invalid, exceeds 10 characters
		return section;
	}

	public static DeclarationSection createSectionWithNullName() {
		DeclarationSection section = createValidSection1();
		section.setName(null); // Invalid, name cannot be null
		return section;
	}
}
