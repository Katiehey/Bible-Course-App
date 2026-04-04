#!/usr/bin/env python3
"""Fix all 60 OT Deep Study lessons:
   - Replace open-ended question segment with factual recall (correct_answer + acceptable_variants)
   - Add vocabulary array (2 terms per lesson)
   - Replace segment_id with sequence integer on all segments
"""

import json, os, sys

BASE = os.path.join(os.path.dirname(__file__), "courses", "old-testament-deep-study-01", "lessons")

LESSONS = {
    "otds_lesson_01": {
        "question_script": "Review question: What two realms does God create on the first day and second day in Genesis 1? Answer: light and darkness on day one, and the expanse separating the waters on day two.",
        "correct_answer": "light and darkness on day one, and the expanse separating the waters on day two",
        "variants": ["day one is light and darkness, day two is sky and waters", "light on day one, sky on day two", "day one light day two firmament"],
        "vocabulary": [{"term": "imago dei", "definition": "Latin phrase meaning image of God; the biblical teaching that human beings are made in God's likeness and bear his representative authority over creation (Genesis 1:26-28)"}, {"term": "Sabbath", "definition": "The seventh day on which God rested from creation; established as a pattern of ceasing work in honor of God's completed work"}]
    },
    "otds_lesson_02": {
        "question_script": "Review question: What did God say the offspring of the woman would do to the serpent in Genesis 3:15? Answer: crush or bruise the serpent's head, while the serpent would strike his heel.",
        "correct_answer": "crush the serpent's head while the serpent strikes his heel",
        "variants": ["the woman's seed would crush the serpent", "bruise the serpents head", "the protoevangelium — the first gospel promise of the serpent-crusher"],
        "vocabulary": [{"term": "protoevangelium", "definition": "Latin meaning first gospel; refers to Genesis 3:15 where God promises enmity between the serpent and the woman's offspring, read as the first messianic promise"}, {"term": "covenant of works", "definition": "The arrangement in Eden where Adam's obedience would secure life for himself and his descendants; broken by the fall"}]
    },
    "otds_lesson_03": {
        "question_script": "Review question: What mark did God place on Cain and what was its purpose? Answer: God placed a mark on Cain to protect him from being killed by anyone who found him.",
        "correct_answer": "a mark to protect him from being killed",
        "variants": ["a protective mark so no one would kill him", "god marked cain for his protection", "a sign of protection from vengeance"],
        "vocabulary": [{"term": "genealogy", "definition": "A record of descent from ancestors; Genesis 5 lists the line from Adam to Noah, emphasizing God's covenant continuity through chosen descendants"}, {"term": "common grace", "definition": "God's general favor shown to all humanity, including those outside the covenant, as seen in Cain receiving protection and civilization developing in his line"}]
    },
    "otds_lesson_04": {
        "question_script": "Review question: What sign did God give Noah as a guarantee that he would never again destroy the earth by flood? Answer: a rainbow.",
        "correct_answer": "a rainbow",
        "variants": ["the rainbow in the clouds", "god set his bow in the cloud", "a bow in the sky"],
        "vocabulary": [{"term": "Noahic covenant", "definition": "God's covenant with Noah and all living creatures after the flood, promising never to destroy the earth by flood again; the rainbow is its sign"}, {"term": "nephilim", "definition": "The beings described in Genesis 6:4 whose presence marks the corruption that preceded the flood; their exact identity is debated among scholars"}]
    },
    "otds_lesson_05": {
        "question_script": "Review question: Why did God scatter the people at Babel and what two things did he change? Answer: God scattered them because they were building a tower to make a name for themselves. He confused their language and dispersed them across the earth.",
        "correct_answer": "they were building a tower to make a name for themselves, so God confused their language and scattered them",
        "variants": ["to prevent them from unifying in rebellion against God", "they disobeyed the command to fill the earth and God confused their language", "pride and unity in sin led God to disperse them"],
        "vocabulary": [{"term": "Table of Nations", "definition": "Genesis 10's list of peoples descended from Noah's three sons, showing the origin of all nations from the post-flood family"}, {"term": "ziggurat", "definition": "A stepped temple-tower common in ancient Mesopotamia; scholars believe the Tower of Babel description reflects this architectural form"}]
    },
    "otds_lesson_06": {
        "question_script": "Review question: What three things did God promise Abram when he called him in Genesis 12:1-3? Answer: a great nation, a great name, and that through him all families of the earth would be blessed.",
        "correct_answer": "a great nation, a great name, and blessing to all families of the earth",
        "variants": ["land, seed, and blessing to all nations", "descendants, fame, and that all peoples would be blessed through him", "nation, name, and blessing"],
        "vocabulary": [{"term": "Abrahamic covenant", "definition": "God's unconditional promise to Abram of land, descendants, and worldwide blessing; the foundational covenant of redemptive history"}, {"term": "call of Abram", "definition": "God's sovereign summons to Abram in Genesis 12 to leave his country for a land God would show him; the beginning of the covenant nation"}]
    },
    "otds_lesson_07": {
        "question_script": "Review question: What sign did God require to mark all male members of Abraham's household under the Abrahamic covenant? Answer: circumcision.",
        "correct_answer": "circumcision",
        "variants": ["the circumcision of every male", "cutting of the foreskin as a covenant sign", "circumcision on the eighth day"],
        "vocabulary": [{"term": "circumcision", "definition": "The cutting of the male foreskin required of all Abraham's household as the physical sign of the Abrahamic covenant (Genesis 17)"}, {"term": "covenant of grant", "definition": "A form of ancient Near Eastern covenant in which a superior grants land or privilege to a vassal unconditionally; scholars classify God's covenant with Abraham in this category"}]
    },
    "otds_lesson_08": {
        "question_script": "Review question: What was Abraham's response when God told him to sacrifice Isaac, and what did God provide instead? Answer: Abraham obeyed and prepared to sacrifice Isaac. God provided a ram caught in a thicket as a substitute.",
        "correct_answer": "God provided a ram caught in a thicket as a substitute for Isaac",
        "variants": ["a ram in the thicket", "god provided the lamb himself", "a ram substituted for Isaac on the mountain"],
        "vocabulary": [{"term": "substitution", "definition": "The theological principle where one party bears consequences intended for another; the ram at Moriah anticipates Christ's substitutionary atonement"}, {"term": "Moriah", "definition": "The mountain where Abraham was commanded to sacrifice Isaac; traditionally identified with the location of Solomon's temple in Jerusalem (2 Chronicles 3:1)"}]
    },
    "otds_lesson_09": {
        "question_script": "Review question: What was the name given to Jacob after he wrestled with God, and what does that name mean? Answer: Israel, meaning one who strives with God or God strives.",
        "correct_answer": "Israel, meaning one who strives with God",
        "variants": ["Israel — he who struggles with God", "Israel meaning wrestles with God", "jacob was renamed israel after the wrestling"],
        "vocabulary": [{"term": "theophany", "definition": "A visible appearance of God to a human being; Jacob's wrestling in Genesis 32 is one of the most striking theophanies in the Old Testament"}, {"term": "birthright", "definition": "The eldest son's inheritance rights, including a double portion; Esau sold his birthright to Jacob for a meal in Genesis 25"}]
    },
    "otds_lesson_10": {
        "question_script": "Review question: What role did Joseph's brothers play in sending him to Egypt, and how did Joseph interpret this later? Answer: his brothers sold him into slavery out of jealousy. Joseph later said God had sent him ahead to preserve life.",
        "correct_answer": "God sent him ahead to preserve life, though his brothers meant it for harm",
        "variants": ["you intended evil but god meant it for good", "god turned his brothers' betrayal into salvation for many", "joseph saw divine providence behind his brothers' sin"],
        "vocabulary": [{"term": "providence", "definition": "God's sovereign governance of all events to accomplish his purposes; Joseph's story is a primary biblical example of providence working through human sin"}, {"term": "coat of many colors", "definition": "The special garment Jacob gave Joseph signifying favoritism; it provoked his brothers' jealousy and set the story of Genesis 37 in motion"}]
    },
    "otds_lesson_11": {
        "question_script": "Review question: When Joseph revealed himself to his brothers in Genesis 45, what did he tell them about who had sent him to Egypt? Answer: Joseph told his brothers that it was God who had sent him to Egypt, not them, to preserve life.",
        "correct_answer": "it was God who sent him to Egypt to preserve life, not his brothers",
        "variants": ["god sent him not his brothers", "god used his brothers' sin to send him ahead to save lives", "you did not send me here — god did"],
        "vocabulary": [{"term": "Judah", "definition": "The fourth son of Jacob whose tribe would carry the messianic line; in Genesis 44, Judah's intercession for Benjamin foreshadows the kingly role his line would hold"}, {"term": "famine", "definition": "The severe food shortage in Canaan and Egypt that drove Jacob's family to Egypt; the setting for the Joseph narrative's climax and Israel's entry into Egypt"}]
    },
    "otds_lesson_12": {
        "question_script": "Review question: What final request did Jacob make before his death regarding his burial? Answer: Jacob asked to be buried with his fathers in the cave of Machpelah in Canaan, not in Egypt.",
        "correct_answer": "to be buried in the cave of Machpelah in Canaan with his fathers",
        "variants": ["bury me in the cave in canaan not egypt", "to be carried back to the promised land for burial", "buried with Abraham and Isaac in Machpelah"],
        "vocabulary": [{"term": "Machpelah", "definition": "The cave Abraham purchased as a burial site; Abraham, Sarah, Isaac, Rebekah, Leah, and Jacob were buried there, marking the patriarchs' claim on the promised land"}, {"term": "blessing of Jacob", "definition": "Jacob's final words to his twelve sons in Genesis 49, including the messianic promise to Judah that the scepter would not depart from his line"}]
    },
    "otds_lesson_13": {
        "question_script": "Review question: What was the name of Moses' mother who hid him for three months? Answer: Jochebed.",
        "correct_answer": "Jochebed",
        "variants": ["his mother jochebed", "jochebed daughter of levi", "the levite woman who hid him"],
        "vocabulary": [{"term": "Pharaoh", "definition": "The title of Egypt's king; the Pharaoh of the exodus is not named in Scripture but used all royal power to resist God's demand to release Israel"}, {"term": "Nile", "definition": "Egypt's great river; the setting for Moses' infancy as Pharaoh ordered Hebrew boys drowned in it, and the site of the first plague when God turned it to blood"}]
    },
    "otds_lesson_14": {
        "question_script": "Review question: What name did God reveal to Moses at the burning bush when Moses asked God's name? Answer: I AM WHO I AM, also given as Yahweh.",
        "correct_answer": "I AM WHO I AM — Yahweh",
        "variants": ["i am who i am", "yahweh — the self-existent one", "YHWH — the LORD"],
        "vocabulary": [{"term": "Yahweh", "definition": "The personal covenant name of Israel's God, rendered LORD in most English translations; revealed at the burning bush as I AM WHO I AM, expressing God's self-existence and faithfulness"}, {"term": "burning bush", "definition": "The miraculous sight of a bush burning without being consumed where God appeared to Moses and commissioned him to lead Israel out of Egypt"}]
    },
    "otds_lesson_15": {
        "question_script": "Review question: What was the tenth and final plague that broke Pharaoh's resistance and led him to release Israel? Answer: the death of every firstborn in Egypt.",
        "correct_answer": "the death of the firstborn throughout Egypt",
        "variants": ["God killed the firstborn of Egypt", "the plague on the firstborn", "death of every firstborn son in egypt"],
        "vocabulary": [{"term": "hardening of Pharaoh's heart", "definition": "The repeated description in Exodus of Pharaoh's refusal to release Israel; both Pharaoh's own choice and God's judicial hardening are described, raising questions about divine sovereignty and human will"}, {"term": "plagues of Egypt", "definition": "Ten divine judgments against Egypt targeting Egyptian gods and Pharaoh's authority, demonstrating Yahweh's supremacy over all rival claims to power"}]
    },
    "otds_lesson_16": {
        "question_script": "Review question: Where was the blood of the Passover lamb to be applied, and what did it protect against? Answer: on the doorposts and lintel of each Israelite household, protecting them from the angel of death.",
        "correct_answer": "on the doorposts and lintel, protecting the household from the angel of death",
        "variants": ["on the door frames of each house", "on the lintel and two doorposts as protection from the destroyer", "the blood marked each home so death passed over"],
        "vocabulary": [{"term": "Passover", "definition": "The annual Israelite feast commemorating God's sparing of the firstborn in Egypt; the blood of a lamb marked each household, and the meal was eaten in haste as Israel prepared to leave"}, {"term": "Festival of Unleavened Bread", "definition": "The seven-day feast immediately following Passover in which no leaven was eaten, symbolizing the hasty departure from Egypt and separation from corruption"}]
    },
    "otds_lesson_17": {
        "question_script": "Review question: What happened to the Egyptian army that pursued Israel at the Red Sea? Answer: the waters returned and drowned the entire army when Israel had passed safely through.",
        "correct_answer": "the waters returned and drowned the Egyptian army",
        "variants": ["they were swallowed by the sea when the waters came back", "the sea closed on pharaoh's chariots and horses", "the Egyptian army was destroyed in the sea"],
        "vocabulary": [{"term": "Song of Moses", "definition": "The victory hymn in Exodus 15 celebrating Israel's deliverance at the sea; one of the oldest poems in Scripture and a model for praise after divine rescue"}, {"term": "Sea of Reeds", "definition": "The Hebrew name for the body of water Israel crossed; often translated Red Sea; the site of Israel's decisive deliverance from Egypt"}]
    },
    "otds_lesson_18": {
        "question_script": "Review question: What food did God provide daily for Israel in the wilderness, and what rule governed how much they could collect on the sixth day? Answer: manna; on the sixth day they were to collect a double portion because none would fall on the Sabbath.",
        "correct_answer": "manna; on the sixth day they collected double because none fell on the Sabbath",
        "variants": ["bread from heaven called manna, with double portion on the sixth day", "manna each morning; twice as much on friday before the sabbath", "god sent manna and forbade collecting on the sabbath"],
        "vocabulary": [{"term": "manna", "definition": "The bread-like substance God provided daily to feed Israel in the wilderness for forty years; Jesus references it in John 6 as he presents himself as the true bread from heaven"}, {"term": "quail", "definition": "The birds God sent when Israel complained about the absence of meat in the wilderness; provided abundantly but followed by a plague when eaten with greed"}]
    },
    "otds_lesson_19": {
        "question_script": "Review question: How many commandments did God give to Israel at Sinai, and what did the first four primarily concern? Answer: ten commandments; the first four govern Israel's exclusive relationship with God.",
        "correct_answer": "ten commandments; the first four concern Israel's relationship with God",
        "variants": ["ten commandments — the first four deal with God and the rest with human relationships", "the decalogue; four commands about God and six about human conduct", "ten — the first table is about God and the second about people"],
        "vocabulary": [{"term": "Decalogue", "definition": "The Ten Commandments given at Sinai in Exodus 20; the moral core of the Mosaic covenant and the foundational law for Israel's community life"}, {"term": "Sinai covenant", "definition": "The covenant God made with Israel at Mount Sinai through Moses, including the Ten Commandments and the Book of the Covenant; structured like ancient suzerain-vassal treaties"}]
    },
    "otds_lesson_20": {
        "question_script": "Review question: What did the people say in unison when Moses read the Book of the Covenant to them in Exodus 24? Answer: All that the LORD has spoken we will do, and we will be obedient.",
        "correct_answer": "All that the LORD has spoken we will do, and we will be obedient",
        "variants": ["we will do everything the lord has said", "all that the LORD commands we will obey", "we will do and be obedient"],
        "vocabulary": [{"term": "Book of the Covenant", "definition": "The collection of laws in Exodus 20:22 through 23:33 that followed the Ten Commandments and governed Israel's civil and religious life"}, {"term": "suzerain-vassal treaty", "definition": "An ancient Near Eastern treaty form between a great king and a subordinate people; scholars identify the Sinai covenant as following this structure with historical prologue, stipulations, and sanctions"}]
    },
    "otds_lesson_21": {
        "question_script": "Review question: What was the primary theological purpose of the tabernacle God commanded Israel to build in Exodus 25-31? Answer: to be a dwelling place where God's presence could dwell among his people.",
        "correct_answer": "for God to dwell among his people — a sanctuary for his presence",
        "variants": ["so God could live in the midst of Israel", "a portable sanctuary for God's presence among Israel", "a dwelling place for Yahweh to tabernacle with Israel"],
        "vocabulary": [{"term": "tabernacle", "definition": "The portable sanctuary God commanded Israel to build so his glory could dwell among them; its design reflected Eden and anticipated the temple and ultimately Christ"}, {"term": "Most Holy Place", "definition": "The innermost room of the tabernacle, separated by a veil, containing the ark of the covenant; only the high priest could enter it once a year on the Day of Atonement"}]
    },
    "otds_lesson_22": {
        "question_script": "Review question: What did Aaron make for Israel while Moses was receiving the law on the mountain? Answer: a golden calf for the people to worship.",
        "correct_answer": "a golden calf",
        "variants": ["an idol of gold in the shape of a calf", "a golden image of a calf that they worshipped", "aaron cast a golden calf for israel to worship"],
        "vocabulary": [{"term": "golden calf", "definition": "The idol Aaron made in Exodus 32 while Moses was on Sinai; a direct violation of the first two commandments and a precursor to Jeroboam's golden calves in 1 Kings 12"}, {"term": "intercession of Moses", "definition": "Moses' repeated prayers on behalf of sinful Israel; in Exodus 32-34, he pleads for God not to destroy the people and models the prophetic role of mediator"}]
    },
    "otds_lesson_23": {
        "question_script": "Review question: What is the Hebrew term for the offering in Leviticus in which the offerer, priest, and God all share in the meal? Answer: the peace offering, also called the fellowship offering or shelamim.",
        "correct_answer": "peace offering — also called fellowship offering or shelamim",
        "variants": ["the shelamim or fellowship offering", "the peace offering where all parties eat", "shelem — the communion sacrifice shared between offerer and priests"],
        "vocabulary": [{"term": "burnt offering", "definition": "The offering entirely consumed by fire on the altar, representing total consecration to God; the most common offering in Leviticus with no portion kept by the offerer"}, {"term": "guilt offering", "definition": "The offering required for unintentional sins and violations of sacred property; it included restitution plus twenty percent and a sacrifice"}]
    },
    "otds_lesson_24": {
        "question_script": "Review question: Why did God strike down Nadab and Abihu, the sons of Aaron, in Leviticus 10? Answer: they offered unauthorized fire before the LORD that he had not commanded.",
        "correct_answer": "they offered unauthorized fire that God had not commanded",
        "variants": ["they brought strange fire before the LORD", "offering fire god had not commanded led to their death", "unauthorized fire — they did not follow God's prescribed worship"],
        "vocabulary": [{"term": "unauthorized fire", "definition": "The fire Nadab and Abihu offered that God had not prescribed; their death establishes that Israel's worship must follow God's exact instructions, not human innovation"}, {"term": "ordination", "definition": "The seven-day ceremony consecrating Aaron and his sons as priests in Leviticus 8-9; the anointing, sacrifice, and blood application set them apart for tabernacle service"}]
    },
    "otds_lesson_25": {
        "question_script": "Review question: What overarching principle governed Israel's clean and unclean distinctions in Leviticus 11-15? Answer: holiness — God's own holy character required Israel to be set apart from impurity as a people belonging to him.",
        "correct_answer": "holiness — be holy as I am holy; clean and unclean mark Israel's separation unto God",
        "variants": ["the principle of holiness separating Israel from defilement", "god is holy so his people must be pure", "separation for holiness — god's people are set apart from all impurity"],
        "vocabulary": [{"term": "clean and unclean", "definition": "The categories in Leviticus 11-15 governing food, skin conditions, and bodily discharges; they marked Israel's sacred status and regulated access to the tabernacle"}, {"term": "Holiness Code", "definition": "The section of Leviticus (chapters 17-26) containing repeated calls to holiness, covering sacrifices, sexual ethics, feasts, and penalties for violations"}]
    },
    "otds_lesson_26": {
        "question_script": "Review question: What happened to the second goat on the Day of Atonement, the scapegoat? Answer: the high priest laid both hands on it and confessed all Israel's sins over it, then it was sent into the wilderness carrying the sins away.",
        "correct_answer": "the high priest confessed Israel's sins over it and sent it into the wilderness to carry sins away",
        "variants": ["it was driven into the wilderness bearing Israel's sins", "the scapegoat carried the sins of israel away from the camp", "azazel — the goat sent bearing the people's guilt"],
        "vocabulary": [{"term": "Day of Atonement", "definition": "Yom Kippur — the annual day when the high priest alone entered the Most Holy Place to make atonement for all Israel's sins through blood sacrifice and the scapegoat ritual"}, {"term": "scapegoat", "definition": "The second goat on Yom Kippur over which Israel's sins were confessed; it was sent into the wilderness symbolizing the removal of sin from the community"}]
    },
    "otds_lesson_27": {
        "question_script": "Review question: What repeated command defines the Holiness Code in Leviticus 17-22? Answer: Be holy, for I the LORD your God am holy.",
        "correct_answer": "Be holy, for I the LORD your God am holy",
        "variants": ["you shall be holy as I am holy", "be holy because god is holy", "the command be holy for I am holy appears repeatedly in the holiness code"],
        "vocabulary": [{"term": "holiness", "definition": "God's fundamental attribute of being set apart from all that is impure or common; Israel is called to reflect this holiness in every area of life"}, {"term": "neighbor love", "definition": "The command in Leviticus 19:18 to love your neighbor as yourself; Jesus identifies this as the second great commandment summarizing the law"}]
    },
    "otds_lesson_28": {
        "question_script": "Review question: How many appointed feasts are listed in Leviticus 23? Answer: seven.",
        "correct_answer": "seven",
        "variants": ["seven appointed feasts", "7 feasts of the LORD", "seven holy convocations"],
        "vocabulary": [{"term": "Feast of Tabernacles", "definition": "The seven-day feast in which Israel lived in booths remembering their wilderness journey; also called Sukkot, it fell at the end of harvest and pointed to God's provision"}, {"term": "Jubilee", "definition": "The fiftieth year commanded in Leviticus 25 when debts were cancelled, slaves freed, and land returned to original owners; a year of liberty reflecting God's ownership of the land"}]
    },
    "otds_lesson_29": {
        "question_script": "Review question: What was the primary purpose of the census in Numbers 1? Answer: to count all men in Israel aged twenty and above who were able to serve in the army.",
        "correct_answer": "to count all men able to serve in the army, twenty years old and above",
        "variants": ["a military census of fighting-age men", "numbering the men of war in each tribe", "counting israel's soldiers before the march to canaan"],
        "vocabulary": [{"term": "census", "definition": "The counting of Israel's fighting men in Numbers 1 and again in Numbers 26; both censuses frame the wilderness generation that died and the new generation that would enter Canaan"}, {"term": "Levites", "definition": "The tribe set apart for tabernacle service rather than military service; they were not included in the military census but counted separately to serve as guardians of the sanctuary"}]
    },
    "otds_lesson_30": {
        "question_script": "Review question: What blessing did God command Aaron and his sons to pronounce over Israel in Numbers 6? Answer: The LORD bless you and keep you; the LORD make his face shine on you and be gracious to you; the LORD turn his face toward you and give you peace.",
        "correct_answer": "The LORD bless you and keep you; the LORD make his face shine on you and be gracious to you; the LORD turn his face toward you and give you peace",
        "variants": ["the Aaronic benediction from numbers 6", "may the lord bless you and keep you — the priestly blessing", "the threefold blessing of peace and grace"],
        "vocabulary": [{"term": "Aaronic blessing", "definition": "The priestly benediction in Numbers 6:24-26 commanded for Aaron and his sons to pronounce over Israel; it remains the most used benediction in Jewish and Christian worship"}, {"term": "Nazirite vow", "definition": "A voluntary vow of consecration in Numbers 6 involving abstaining from wine, not cutting hair, and avoiding corpses; Samson and John the Baptist are notable Nazirites"}]
    },
    "otds_lesson_31": {
        "question_script": "Review question: What guided Israel's movement through the wilderness — when to stop and when to march? Answer: the cloud over the tabernacle: when it lifted, Israel marched; when it settled, Israel camped.",
        "correct_answer": "the cloud over the tabernacle — when it lifted Israel marched, when it settled they camped",
        "variants": ["a cloud by day and fire by night over the tabernacle", "when the cloud lifted they moved, when it rested they stopped", "the pillar of cloud and fire directed all movement"],
        "vocabulary": [{"term": "pillar of cloud and fire", "definition": "The visible manifestation of God's presence guiding Israel through the wilderness; by day a cloud and by night a fire, it directed every march and rest"}, {"term": "silver trumpets", "definition": "Two silver trumpets in Numbers 10 used to signal Israel's movements and assemblies; they established order for the march and called leaders to meet Moses"}]
    },
    "otds_lesson_32": {
        "question_script": "Review question: Why did God prevent the entire first generation of Israel from entering Canaan? Answer: because they believed the report of the ten spies and refused to enter the land, showing unbelief in God's promise.",
        "correct_answer": "unbelief — they refused to enter Canaan after the ten spies' negative report",
        "variants": ["they believed the ten spies and rejected god's promise", "rebellion and unbelief at Kadesh-Barnea", "because they failed to trust god after the spies' report"],
        "vocabulary": [{"term": "Kadesh-Barnea", "definition": "The location where Israel rejected God's command to enter Canaan after the twelve spies' report; the site of judgment where the first generation was condemned to die in the wilderness"}, {"term": "Caleb and Joshua", "definition": "The two spies who gave a faithful report and urged Israel to enter Canaan; they alone of the first generation survived to enter the promised land"}]
    },
    "otds_lesson_33": {
        "question_script": "Review question: What did Moses do at Meribah that disqualified him from entering the promised land? Answer: God told Moses to speak to the rock, but Moses struck it twice in anger instead.",
        "correct_answer": "Moses struck the rock twice instead of speaking to it as God commanded",
        "variants": ["he hit the rock instead of speaking to it", "moses struck the rock in anger disobeying god's command", "he dishonored god before the people by striking rather than speaking to the rock"],
        "vocabulary": [{"term": "Meribah", "definition": "The place of strife where Moses struck the rock in disobedience; the event that cost Moses the right to enter Canaan and illustrates that even God's servants face consequences for dishonoring him"}, {"term": "bronze serpent", "definition": "The bronze image Moses made and raised on a pole in Numbers 21 so that those bitten by serpents could look at it and live; Jesus references this in John 3:14 as a type of his crucifixion"}]
    },
    "otds_lesson_34": {
        "question_script": "Review question: What was Balaam hired to do, and what did he do instead? Answer: Balak hired Balaam to curse Israel, but Balaam blessed Israel four times because God would only allow blessing.",
        "correct_answer": "he was hired to curse Israel but blessed them instead because God compelled him",
        "variants": ["he blessed israel four times instead of cursing them", "god turned balaam's curses into blessings", "Balak hired him to curse but the LORD put blessing in his mouth"],
        "vocabulary": [{"term": "Balaam", "definition": "The diviner hired by Balak to curse Israel in Numbers 22-24; God caused him to bless Israel four times instead, including a prophecy of a star rising from Jacob"}, {"term": "Balak", "definition": "King of Moab who hired Balaam to curse Israel; his plan failed but Numbers 25 records that Balaam later counseled leading Israel into sexual immorality and idolatry"}]
    },
    "otds_lesson_35": {
        "question_script": "Review question: What does the name Deuteronomy mean? Answer: second law, or repetition of the law.",
        "correct_answer": "second law — or repetition of the law",
        "variants": ["the second giving of the law", "deuteronomy means the repeated law", "second law from Greek deutero nomos"],
        "vocabulary": [{"term": "Deuteronomy", "definition": "The fifth book of the Torah; three farewell speeches from Moses to Israel on the plains of Moab before his death, reviewing the law and calling for covenant faithfulness in the land"}, {"term": "covenant renewal", "definition": "The restatement and recommitment to the Sinai covenant in Deuteronomy; addressed to the new generation about to enter Canaan who had not been present at Sinai"}]
    },
    "otds_lesson_36": {
        "question_script": "Review question: What is the Shema, and where is it found? Answer: Hear O Israel: the LORD our God, the LORD is one. It is found in Deuteronomy 6:4.",
        "correct_answer": "Hear O Israel: the LORD our God, the LORD is one — Deuteronomy 6:4",
        "variants": ["Shema Yisrael Adonai Eloheinu Adonai Echad — Deuteronomy 6:4", "the LORD is one — in Deuteronomy chapter 6", "the jewish confession of God's unity in Deuteronomy 6"],
        "vocabulary": [{"term": "Shema", "definition": "Hebrew for hear; the opening word of Deuteronomy 6:4 and the title for Israel's central confession of faith in the oneness of God, recited morning and evening"}, {"term": "love the LORD your God", "definition": "The great commandment of Deuteronomy 6:5 — to love God with all heart, soul, and strength; the entire law flows from and returns to this total devotion"}]
    },
    "otds_lesson_37": {
        "question_script": "Review question: What warning did Moses give Israel about wealth in the promised land in Deuteronomy 8? Answer: do not say in your heart that your own power produced your wealth; remember the LORD who led you through the wilderness.",
        "correct_answer": "do not forget the LORD by thinking your own strength produced your wealth",
        "variants": ["beware of forgetting god when you are prosperous", "do not say my power built this wealth — remember the LORD", "prosperity without remembrance of God leads to destruction"],
        "vocabulary": [{"term": "manna and wilderness", "definition": "Moses recalls Israel's forty years in the wilderness in Deuteronomy 8 as God's humbling and testing, teaching that man does not live by bread alone but by every word of God"}, {"term": "land flowing with milk and honey", "definition": "The recurring description of Canaan's abundance in Deuteronomy; it signifies God's generous provision for his people but also carries the warning that provision can become a source of pride"}]
    },
    "otds_lesson_38": {
        "question_script": "Review question: Where did Deuteronomy command Israel to bring all their sacrifices and offerings? Answer: to the one place the LORD your God will choose — the central sanctuary.",
        "correct_answer": "to the place the LORD your God will choose — the central sanctuary",
        "variants": ["the centralized place of worship God would designate", "one sanctuary chosen by God — not wherever they please", "centralization of worship at the place god would choose"],
        "vocabulary": [{"term": "centralization of worship", "definition": "Deuteronomy 12's command to offer sacrifices only at the place God would choose; this curbed local high places and ultimately pointed to Jerusalem and the temple"}, {"term": "tithe", "definition": "A tenth of agricultural produce and animals commanded in Deuteronomy 14; portions went to the Levites, the central sanctuary feast, and the poor in alternating years"}]
    },
    "otds_lesson_39": {
        "question_script": "Review question: What three things did the law of the king in Deuteronomy 17 forbid Israel's future king from doing? Answer: acquiring many horses, acquiring many wives, and accumulating excessive silver and gold.",
        "correct_answer": "not multiply horses, not multiply wives, and not accumulate excessive silver and gold",
        "variants": ["no many horses — no many wives — no excessive wealth", "the king must not multiply horses wives or money", "three limits on the king: horses, wives, and wealth"],
        "vocabulary": [{"term": "law of the king", "definition": "Deuteronomy 17:14-20's regulations for Israel's future king; he must not multiply horses, wives, or wealth, and must copy and read the law daily — a standard Solomon violates in all three areas"}, {"term": "copy of the law", "definition": "The king's command in Deuteronomy 17:18 to write out a copy of the law for himself and read it daily so he learns to fear God and not elevate himself above his brothers"}]
    },
    "otds_lesson_40": {
        "question_script": "Review question: What did the worshipper recite when presenting the firstfruits offering in Deuteronomy 26? Answer: a historical recital beginning with My father was a wandering Aramean, summarizing God's saving acts from Abraham through the exodus and entry into the land.",
        "correct_answer": "a recital of Israel's history from Abraham's wandering through the exodus to entry into the land",
        "variants": ["my father was a wandering aramean — the salvation history confession", "a creedal summary of Israel's story from patriarchs to the land", "the historical confession beginning with the wandering aramean"],
        "vocabulary": [{"term": "firstfruits", "definition": "The first and best portion of harvest brought to God in Deuteronomy 26; the act acknowledged God's ownership of the land and Israel's dependence on his provision"}, {"term": "wandering Aramean", "definition": "The description of Jacob in Deuteronomy 26:5; Israel's identity begins not with triumph but with a foreigner's journey, establishing that their nationhood is entirely God's gift"}]
    },
    "otds_lesson_41": {
        "question_script": "Review question: What two mountains were used in the blessings and curses ceremony commanded in Deuteronomy 27-28? Answer: Mount Gerizim for the blessings and Mount Ebal for the curses.",
        "correct_answer": "Mount Gerizim for blessings and Mount Ebal for curses",
        "variants": ["Ebal and Gerizim", "gerizim held the blessings and ebal the curses", "the blessing mountain was gerizim and the curse mountain was ebal"],
        "vocabulary": [{"term": "covenant blessings and curses", "definition": "The detailed list in Deuteronomy 28 of blessings for obedience and curses for disobedience; the curses climax in exile, which later becomes Israel's actual history"}, {"term": "Shechem", "definition": "The valley between Ebal and Gerizim where the covenant ceremony was commanded; the site of Joshua's covenant renewal in Joshua 24"}]
    },
    "otds_lesson_42": {
        "question_script": "Review question: Who buried Moses and where, and why does the text say no one knows his burial place? Answer: God himself buried Moses in the valley opposite Beth-peor, and his burial place was kept unknown to prevent his grave becoming a site of worship.",
        "correct_answer": "God buried Moses in the valley opposite Beth-peor, and no one knows the location",
        "variants": ["the LORD buried him and his grave is unknown", "god himself interred moses so no shrine would be built there", "Moses was buried by God in an unknown place in Moab"],
        "vocabulary": [{"term": "Song of Moses", "definition": "The long poem in Deuteronomy 32 Moses was commanded to teach Israel; it anticipates Israel's future rebellion, God's judgment, and ultimate vindication"}, {"term": "prophet like Moses", "definition": "The promise in Deuteronomy 18:15 and 34:10 that God would raise up a prophet like Moses; fulfilled ultimately in Jesus as the greater Prophet, Priest, and King"}]
    },
    "otds_lesson_43": {
        "question_script": "Review question: What miracle marked Israel's crossing of the Jordan River into Canaan? Answer: the Jordan stopped flowing and stood as a heap while Israel crossed on dry ground, just as the Red Sea had parted for Moses.",
        "correct_answer": "the Jordan stopped flowing and Israel crossed on dry ground",
        "variants": ["the waters of the jordan piled up and israel walked through on dry land", "god stopped the jordan river so israel could cross", "the Jordan parted as the Red Sea had parted for Moses"],
        "vocabulary": [{"term": "ark of the covenant", "definition": "The gold-covered box containing the tablets of the law; the priests carried it into the Jordan and its presence caused the river to stop, leading Israel's procession into the land"}, {"term": "circumcision at Gilgal", "definition": "The mass circumcision of all males born in the wilderness in Joshua 5; the wilderness generation had not been circumcised, and God required the covenant sign before the first battle"}]
    },
    "otds_lesson_44": {
        "question_script": "Review question: How did the walls of Jericho fall? Answer: Israel marched around the city for six days, and on the seventh day marched seven times, the priests blew the trumpets, the people shouted, and the walls collapsed.",
        "correct_answer": "Israel marched for seven days, the priests blew trumpets, the people shouted, and the walls fell",
        "variants": ["they marched seven days seven times on the last day and shouted", "the trumpets and shout brought the walls down", "seven days of marching with priests blowing trumpets until the walls fell"],
        "vocabulary": [{"term": "herem", "definition": "The Hebrew term for the ban or devoted destruction; in Jericho, all persons and animals were to be destroyed as an act of consecration to God — a judgment not a war tactic"}, {"term": "Rahab", "definition": "The Canaanite woman of Jericho who hid the Israelite spies and was spared; she is included in Jesus' genealogy in Matthew 1 and cited in Hebrews 11 as a woman of faith"}]
    },
    "otds_lesson_45": {
        "question_script": "Review question: How was the land of Canaan distributed among the tribes of Israel? Answer: by lot before the LORD at Shiloh.",
        "correct_answer": "by lot before the LORD at Shiloh",
        "variants": ["casting lots at shiloh to determine each tribe's portion", "they cast lots at the tabernacle in Shiloh for each tribal allotment", "God determined the land boundaries through the lot at Shiloh"],
        "vocabulary": [{"term": "tribal allotment", "definition": "The division of Canaan's land among the twelve tribes by lot in Joshua 13-21; the Levites received cities among the tribes rather than a tribal territory, since God was their inheritance"}, {"term": "cities of refuge", "definition": "Six cities set aside in Joshua 20 where someone who killed accidentally could flee until a trial; they protected the innocent from blood vengeance"}]
    },
    "otds_lesson_46": {
        "question_script": "Review question: What choice did Joshua present to Israel in the covenant renewal at Shechem in Joshua 24? Answer: choose whom you will serve — either the gods your fathers served or the LORD — and Joshua declared that he and his house would serve the LORD.",
        "correct_answer": "choose whom you will serve — the ancestral gods or the LORD",
        "variants": ["choose this day whom you will serve", "serve the gods your fathers served or the LORD — joshua said he would serve the LORD", "the choice between false gods and Yahweh at Shechem"],
        "vocabulary": [{"term": "covenant renewal", "definition": "Joshua 24's covenant ceremony at Shechem where all Israel pledged loyalty to the LORD after the conquest; the people's repeated declarations foreshadow their later failure to keep the commitment"}, {"term": "Shechem", "definition": "The site of Joshua's covenant assembly and Israel's covenant renewal; Abraham built his first altar there in Canaan (Genesis 12:6) and Jacob purchased land there"}]
    },
    "otds_lesson_47": {
        "question_script": "Review question: What recurring four-stage cycle appears throughout the book of Judges? Answer: Israel sins by serving other gods, God sends an oppressor, Israel cries out, God raises a judge to deliver them, there is peace, and then Israel sins again.",
        "correct_answer": "sin, oppression, crying out, deliverance by a judge, peace, and then sin again",
        "variants": ["sin — oppression — cry — deliverance — rest — sin", "the judges cycle of apostasy rescue and return to sin", "four stages: Israel sins, God punishes, Israel repents, God delivers"],
        "vocabulary": [{"term": "judge", "definition": "A military deliverer raised by God to rescue Israel from foreign oppression; unlike later kings, judges did not inherit their role and Israel reverted to sin after each judge died"}, {"term": "Baal", "definition": "The Canaanite storm deity Israel repeatedly worshipped in violation of the covenant; the name appears repeatedly in Judges as the god that drew Israel away from Yahweh"}]
    },
    "otds_lesson_48": {
        "question_script": "Review question: What was the name of the prophetess and judge who summoned Barak to lead Israel against Sisera? Answer: Deborah.",
        "correct_answer": "Deborah",
        "variants": ["deborah the prophetess", "deborah who judged israel and summoned barak", "judge deborah"],
        "vocabulary": [{"term": "Deborah", "definition": "The only female judge in Israel, also a prophetess; she held court under the palm of Deborah and delivered Israel from Jabin's army through Barak and Jael"}, {"term": "Gideon", "definition": "The judge called by God in Judges 6-8 to deliver Israel from the Midianites with three hundred men; his victory with torches and jars illustrates that God's strength is made perfect in weakness"}]
    },
    "otds_lesson_49": {
        "question_script": "Review question: What was the source of Samson's extraordinary strength according to Judges? Answer: his long hair, as a Nazirite consecrated to God from birth.",
        "correct_answer": "his uncut hair as a Nazirite set apart to God from birth",
        "variants": ["long hair as a symbol of his nazirite vow", "his strength came from his consecration to God — symbolized by his hair", "samson's hair was the outward sign of his nazirite dedication"],
        "vocabulary": [{"term": "Nazirite", "definition": "One who takes a vow of consecration in Numbers 6, abstaining from wine, not cutting hair, and avoiding corpses; Samson's Nazirite status from birth made his strength a divine gift, not a personal power"}, {"term": "Delilah", "definition": "The Philistine woman who discovered the source of Samson's strength and betrayed him to the Philistines; Samson's failure with her is the final stage of his compromised Nazirite life"}]
    },
    "otds_lesson_50": {
        "question_script": "Review question: What statement is repeated twice at the end of Judges to explain the chaos described in chapters 17-21? Answer: In those days there was no king in Israel. Everyone did what was right in his own eyes.",
        "correct_answer": "In those days there was no king in Israel. Everyone did what was right in his own eyes.",
        "variants": ["everyone did what was right in their own eyes — no king in israel", "there was no king and everyone lived by their own standard", "Judges ends with — no king, everyone doing what seemed right to them"],
        "vocabulary": [{"term": "moral relativism in Judges", "definition": "The state described at the end of Judges where absence of authoritative leadership produced social and religious chaos; it prepares the reader for the monarchy"}, {"term": "tribe of Dan", "definition": "The tribe in Judges 17-18 that stole a Levite and set up an idolatrous shrine in the north; their story illustrates how far Israel had fallen from covenant faithfulness"}]
    },
    "otds_lesson_51": {
        "question_script": "Review question: What is the Hebrew term for the role Boaz fulfilled in redeeming Naomi's land and marrying Ruth? Answer: kinsman-redeemer, or goel in Hebrew.",
        "correct_answer": "kinsman-redeemer — goel in Hebrew",
        "variants": ["goel — the near kinsman who redeems", "kinsman redeemer — the family member who buys back land and provides an heir", "the goel role of buying back what a family has lost"],
        "vocabulary": [{"term": "goel", "definition": "Hebrew for kinsman-redeemer; the family member with the right and responsibility to buy back property, marry a widow, and redeem what was lost; Boaz fulfills this role for Naomi and Ruth"}, {"term": "Moabite", "definition": "A member of the nation east of the Dead Sea descended from Lot; Ruth is a Moabite who joins Israel through faith in Yahweh and becomes an ancestor of David and Jesus"}]
    },
    "otds_lesson_52": {
        "question_script": "Review question: Why did God reject Saul as king of Israel? Answer: because Saul disobeyed God's command to completely destroy the Amalekites and instead kept Agag and the best livestock.",
        "correct_answer": "Saul disobeyed God's command to destroy all the Amalekites and kept plunder",
        "variants": ["he spared Agag and kept livestock against God's command", "partial obedience in the Amalekite battle led to his rejection", "saul kept the best sheep and agag disobeying the herem command"],
        "vocabulary": [{"term": "Samuel", "definition": "The last judge and first major prophet of Israel; he anointed both Saul and David as king and confronted Saul with the famous declaration that obedience is better than sacrifice"}, {"term": "obedience over sacrifice", "definition": "Samuel's rebuke of Saul in 1 Samuel 15:22 — God desires obedience more than religious ritual; it establishes the prophetic principle that external worship without inward compliance is rejected"}]
    },
    "otds_lesson_53": {
        "question_script": "Review question: What reason did God give Samuel for choosing David over David's older brothers? Answer: God looks at the heart, not outward appearance.",
        "correct_answer": "God looks at the heart, not outward appearance",
        "variants": ["the LORD looks on the heart not the outward appearance", "man looks at the outside but god sees the heart", "God does not judge by height or appearance — he sees the inner man"],
        "vocabulary": [{"term": "anointing", "definition": "The pouring of oil on a person's head to set them apart for a role; Samuel anointed David privately in 1 Samuel 16 and the Spirit came upon him, beginning his preparation for kingship"}, {"term": "Goliath", "definition": "The Philistine champion whose challenge David accepted in 1 Samuel 17; David's victory with a sling and stone established his public reputation and demonstrated that the battle belongs to the LORD"}]
    },
    "otds_lesson_54": {
        "question_script": "Review question: What did God promise David in the Davidic covenant of 2 Samuel 7? Answer: that David's son would build the temple, God would be a father to him, and David's throne and kingdom would be established forever.",
        "correct_answer": "David's throne and kingdom would be established forever, and God would be father to his son",
        "variants": ["an everlasting dynasty — God would be father to david's son and establish his throne forever", "the davidic covenant — eternal throne and father-son relationship with david's line", "2 Samuel 7 — god promises david an eternal dynasty"],
        "vocabulary": [{"term": "Davidic covenant", "definition": "God's unconditional promise to David in 2 Samuel 7 that his dynasty would be established forever and God would be father to his son; the foundation for the messianic expectation of a coming king from David's line"}, {"term": "Nathan the prophet", "definition": "The prophet who delivered God's covenant promise to David in 2 Samuel 7 and later confronted David after the sin with Bathsheba"}]
    },
    "otds_lesson_55": {
        "question_script": "Review question: What prophet confronted David over his sin with Bathsheba and murder of Uriah? Answer: Nathan.",
        "correct_answer": "Nathan",
        "variants": ["the prophet Nathan", "Nathan the prophet who told the parable of the ewe lamb", "nathan confronted david with the parable of the poor man's lamb"],
        "vocabulary": [{"term": "Bathsheba", "definition": "Uriah's wife whom David took after seeing her bathing; David's adultery and arranging of Uriah's death is the great sin of his reign and leads to lasting consequences for his household"}, {"term": "parable of the ewe lamb", "definition": "Nathan's story to David in 2 Samuel 12 about a rich man who seized a poor man's beloved lamb; designed to provoke David's judgment before revealing David was the rich man"}]
    },
    "otds_lesson_56": {
        "question_script": "Review question: Why did God allow the kingdom to be divided after Solomon's death? Answer: because Solomon had turned to worship the foreign gods of his many wives in his old age, violating the first commandment.",
        "correct_answer": "Solomon worshipped foreign gods in his old age, violating the covenant",
        "variants": ["he went after the gods of his wives and God tore the kingdom from his line", "covenant violation through idolatry led to the divided kingdom", "solomon's foreign wives turned his heart to other gods"],
        "vocabulary": [{"term": "Solomon", "definition": "David's son who built the temple and ruled Israel's greatest territorial extent; his wisdom was legendary but his seven hundred wives and three hundred concubines led him to idolatry and covenant failure"}, {"term": "Rehoboam", "definition": "Solomon's son who became king; his harsh response to the ten tribes' request for lighter burdens led to the kingdom's division under Jeroboam of the north"}]
    },
    "otds_lesson_57": {
        "question_script": "Review question: What sin did Jeroboam set up to prevent Israel from returning to Jerusalem for worship? Answer: two golden calves at Bethel and Dan, telling the people these were the gods who brought them out of Egypt.",
        "correct_answer": "two golden calves at Bethel and Dan to serve as substitute worship centers",
        "variants": ["golden calves at bethel and dan echoing Aaron's sin at Sinai", "he set up two calves to keep the northern tribes from going to Jerusalem", "the sin of jeroboam — golden calves at bethel and dan"],
        "vocabulary": [{"term": "sin of Jeroboam", "definition": "The phrase used repeatedly in Kings for the golden calf worship Jeroboam established; it becomes the standard charge against every northern king and explains why the northern kingdom fell"}, {"term": "Elijah", "definition": "The prophet who confronted King Ahab and the prophets of Baal on Mount Carmel in 1 Kings 18; his dramatic ministry demonstrated Yahweh's superiority over the Baal worship of Ahab's court"}]
    },
    "otds_lesson_58": {
        "question_script": "Review question: Why was the northern kingdom of Israel exiled to Assyria according to 2 Kings 17? Answer: because they rejected God's commands, followed the sins of Jeroboam, and would not listen to the prophets God sent them.",
        "correct_answer": "they rejected God's commands, followed Jeroboam's sin, and ignored the prophets",
        "variants": ["persistent idolatry and rejection of the prophets brought assyrian exile", "2 kings 17 attributes the exile to their following the sins of jeroboam", "they walked in the sins of the nations and were removed from the land"],
        "vocabulary": [{"term": "Assyrian exile", "definition": "The deportation of the northern kingdom of Israel in 722 BC by Assyria under Shalmaneser V and Sargon II; 2 Kings 17 attributes it directly to covenant unfaithfulness"}, {"term": "Elisha", "definition": "Elijah's successor whose ministry in 2 Kings 2-13 is marked by many miracles; his healing of Naaman the Syrian foreshadows the gospel's extension to Gentiles"}]
    },
    "otds_lesson_59": {
        "question_script": "Review question: Which king of Judah discovered the Book of the Law in the temple during repair work? Answer: Josiah.",
        "correct_answer": "Josiah",
        "variants": ["king josiah", "Josiah son of Amon king of judah", "the young king josiah who tore his robes on hearing the law"],
        "vocabulary": [{"term": "Josiah", "definition": "The reforming king of Judah who discovered the Book of the Law in 2 Kings 22 and led a major covenant renewal; his reforms delayed Judah's judgment but could not reverse the accumulated sin"}, {"term": "Babylonian exile", "definition": "The deportation of Judah to Babylon in three stages: 605, 597, and 586 BC under Nebuchadnezzar; the temple was destroyed in 586 BC, fulfilling the covenant curses of Deuteronomy 28"}]
    },
    "otds_lesson_60": {
        "question_script": "Review question: What is the primary concern of Chronicles that distinguishes it from Samuel and Kings? Answer: Chronicles focuses on the temple, legitimate worship, and the Davidic line as the hope of the returning exiles.",
        "correct_answer": "the temple, legitimate Davidic worship, and hope for the post-exilic community",
        "variants": ["worship centered on the temple and the davidic line", "chronicles emphasizes the temple and priestly worship more than the political history of kings", "the chronicler's concern is proper worship and the continuity of David's line"],
        "vocabulary": [{"term": "Chronicler", "definition": "The author of 1-2 Chronicles, traditionally identified with Ezra; writing after the exile, he retells Israel's history from Adam to Cyrus's decree with emphasis on David, the temple, and proper worship"}, {"term": "Cyrus decree", "definition": "The proclamation of Cyrus king of Persia in 2 Chronicles 36:22-23 permitting the exiles to return and rebuild the temple; Chronicles ends with this word of hope pointing toward Ezra-Nehemiah"}]
    }
}

def fix_lesson(lesson_id, data):
    lesson_data = LESSONS.get(lesson_id)
    if not lesson_data:
        print(f"  No data for {lesson_id}, skipping")
        return None

    # Fix segments: replace segment_id with sequence integers, fix question segment
    segment_type_to_seq = {
        "orientation": 1, "reading": 2, "context": 3,
        "analysis": 4, "themes": 5, "question": 6, "close": 7
    }

    new_segments = []
    for seg in data.get("segments", []):
        new_seg = {}
        seg_type = seg.get("type", "")
        # Replace segment_id with sequence
        new_seg["type"] = seg_type
        new_seg["sequence"] = segment_type_to_seq.get(seg_type, 0)

        if seg_type == "question":
            new_seg["audio_script"] = lesson_data["question_script"]
            new_seg["correct_answer"] = lesson_data["correct_answer"]
            new_seg["acceptable_variants"] = lesson_data["variants"]
            new_seg["word_count"] = len(lesson_data["question_script"].split())
        else:
            new_seg["audio_script"] = seg.get("audio_script", "")
            new_seg["word_count"] = len(seg.get("audio_script", "").split())

        new_segments.append(new_seg)

    data["segments"] = new_segments
    data["vocabulary"] = lesson_data["vocabulary"]
    return data

processed = 0
errors = 0
for lesson_id in sorted(LESSONS.keys()):
    filepath = os.path.join(BASE, f"{lesson_id}.json")
    if not os.path.exists(filepath):
        print(f"FILE NOT FOUND: {filepath}")
        errors += 1
        continue

    with open(filepath, "r") as f:
        data = json.load(f)

    updated = fix_lesson(lesson_id, data)
    if updated:
        with open(filepath, "w") as f:
            json.dump(updated, f, indent=2, ensure_ascii=False)
        print(f"  Updated {lesson_id}")
        processed += 1

print(f"\nDone. {processed} lessons updated, {errors} errors.")
