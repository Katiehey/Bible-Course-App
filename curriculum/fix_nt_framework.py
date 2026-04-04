#!/usr/bin/env python3
"""Fix all NT framework lessons across Mark, Luke, John, Acts, Pauline, General Epistles:
   - Replace open-ended question with factual recall (correct_answer + acceptable_variants)
   - Add vocabulary array (2 terms per lesson)
   - Normalize segment structure (use sequence int, not segment_id)
"""

import json, os

BASE = os.path.join(os.path.dirname(__file__), "courses")

LESSONS = {
    # ── MARK ───────────────────────────────────────────────────────────────
    "ntf02_lesson_01": {
        "course": "new-testament-foundations-02-mark",
        "q": "Review question: What is the first thing Jesus does after being baptized and tempted in Mark 1? Answer: he calls four fishermen — Simon, Andrew, James, and John — to follow him.",
        "answer": "he calls four fishermen to follow him — Simon, Andrew, James, and John",
        "variants": ["he calls his first disciples", "he summons simon and andrew then james and john", "jesus calls four fishermen as disciples"],
        "vocab": [{"term": "immediately", "definition": "Mark's signature Greek word (euthys) appearing over forty times; its repetition creates the urgency and pace distinctive to Mark's Gospel"}, {"term": "exorcism", "definition": "The casting out of a demon; Mark begins Jesus' public ministry with an exorcism in the Capernaum synagogue, establishing his authority over evil powers"}]
    },
    "ntf02_lesson_02": {
        "course": "new-testament-foundations-02-mark",
        "q": "Review question: What accusation did the religious leaders make when Jesus healed the paralytic by declaring his sins forgiven? Answer: they accused him of blasphemy, saying only God can forgive sins.",
        "answer": "they accused Jesus of blasphemy, saying only God can forgive sins",
        "variants": ["who can forgive sins but God alone — blasphemy", "the scribes said he blasphemed because only god forgives sin", "accusation of blasphemy for claiming to forgive sins"],
        "vocab": [{"term": "Son of Man", "definition": "Jesus' most frequent self-designation in Mark, drawn from Daniel 7:13; it combines humility with divine authority and becomes central to his passion predictions"}, {"term": "sabbath controversy", "definition": "The series of conflicts in Mark 2-3 over what is lawful on the Sabbath; Jesus' claim that the Son of Man is lord of the Sabbath reveals his divine authority"}]
    },
    "ntf02_lesson_03": {
        "course": "new-testament-foundations-02-mark",
        "q": "Review question: What is the main teaching of the Parable of the Sower in Mark 4? Answer: the different soils represent different responses to the word — some hear and bear fruit, others are choked by worries or hardened by opposition.",
        "answer": "different soils represent different responses to God's word — only the good soil bears lasting fruit",
        "variants": ["the parable shows why some people respond to the word and others do not", "the four soils describe four types of hearers of the kingdom message", "some hear the word but trials and riches choke it — only receptive hearts bear fruit"],
        "vocab": [{"term": "parable", "definition": "A short story using earthly images to reveal truths about the kingdom of God; Jesus used parables to reveal truth to insiders and conceal it from those who refused to hear"}, {"term": "Messianic Secret", "definition": "Mark's pattern of Jesus commanding silence about his identity after miracles and exorcisms; it prevents premature misunderstanding of his messiahship before the cross"}]
    },
    "ntf02_lesson_04": {
        "course": "new-testament-foundations-02-mark",
        "q": "Review question: What did the man called Legion ask Jesus not to do, and what did Jesus do with the demons? Answer: he asked Jesus not to send them out of the region. Jesus sent the demons into a herd of pigs that rushed into the sea.",
        "answer": "Jesus sent the demons into a herd of pigs that ran into the sea",
        "variants": ["the demons entered two thousand pigs that drowned in the sea", "jesus permitted the demons to enter the swine who rushed into the sea", "legion begged not to leave the region and entered the pigs"],
        "vocab": [{"term": "Gerasenes", "definition": "The Gentile region where Jesus cast out Legion; Jesus' crossing to Gentile territory in Mark 5 shows the kingdom extending beyond Israel's borders"}, {"term": "Legion", "definition": "The name of the demon-possessed man's afflicting spirits, meaning a Roman military unit of thousands; the name hints at the enormous scale of his oppression"}]
    },
    "ntf02_lesson_05": {
        "course": "new-testament-foundations-02-mark",
        "q": "Review question: In Mark 5, what did the woman with the bleeding condition do to be healed, and what did Jesus say was the cause of her healing? Answer: she touched the hem of Jesus' garment. Jesus said your faith has made you well.",
        "answer": "she touched Jesus' garment and he said your faith has made you well",
        "variants": ["she touched his cloak and jesus told her faith healed her", "her faith — she reached out and touched his garment", "jesus said faith has saved you — she had touched him in the crowd"],
        "vocab": [{"term": "faith in Mark", "definition": "A recurring theme where Jesus commends or responds to genuine trust; faith is not earning but receiving — the bleeding woman's reach and Jairus's continued trust are models"}, {"term": "Jairus", "definition": "The synagogue ruler who asked Jesus to heal his dying daughter; his faith was tested when the girl died, but Jesus restored her to life"}]
    },
    "ntf02_lesson_06": {
        "course": "new-testament-foundations-02-mark",
        "q": "Review question: How many loaves and fish did Jesus use to feed the five thousand, and how much food remained? Answer: five loaves and two fish, with twelve baskets of fragments remaining.",
        "answer": "five loaves and two fish; twelve baskets of fragments remained",
        "variants": ["five loaves two fish — twelve baskets left over", "jesus fed five thousand with five loaves and two fish leaving twelve baskets", "five and two with twelve basketfuls remaining"],
        "vocab": [{"term": "feeding of the five thousand", "definition": "The only miracle recorded in all four Gospels; in Mark, it echoes Moses feeding Israel with manna and anticipates the Lord's Supper"}, {"term": "twelve baskets", "definition": "The twelve baskets of leftover fragments after the feeding of the five thousand; the number twelve likely represents the twelve tribes of Israel, signaling abundance for all God's people"}]
    },
    "ntf02_lesson_07": {
        "course": "new-testament-foundations-02-mark",
        "q": "Review question: What answer did Peter give when Jesus asked who the disciples believed him to be? Answer: You are the Christ — the Messiah.",
        "answer": "You are the Christ — the Messiah",
        "variants": ["peter said you are the christ", "you are the messiah — Peter's confession at caesarea philippi", "peter confessed jesus as the christ the son of God"],
        "vocab": [{"term": "Caesarea Philippi", "definition": "The location of Peter's great confession in Mark 8:27-30; the northernmost point of Jesus' ministry and the turning point where Jesus begins predicting his death"}, {"term": "transfiguration", "definition": "The event in Mark 9 where Jesus' appearance was transformed on the mountain with Moses and Elijah present; a preview of his resurrection glory and confirmation of his divine identity"}]
    },
    "ntf02_lesson_08": {
        "course": "new-testament-foundations-02-mark",
        "q": "Review question: What did Jesus say was required of anyone who wished to be first among his disciples? Answer: to be servant of all.",
        "answer": "to be servant of all",
        "variants": ["whoever wants to be first must be slave of all", "greatness in the kingdom is measured by service", "the greatest must become the servant of all"],
        "vocab": [{"term": "servant leadership", "definition": "Jesus' countercultural model of greatness in Mark 9-10; the disciples argued about who was greatest while Jesus called them to be last and servant of all"}, {"term": "ransom", "definition": "The term Jesus uses in Mark 10:45 — the Son of Man came not to be served but to serve and give his life as a ransom for many; a foundational atonement statement in Mark"}]
    },
    "ntf02_lesson_09": {
        "course": "new-testament-foundations-02-mark",
        "q": "Review question: What did Jesus say about the widow's offering that differed from all the other givers? Answer: she gave out of her poverty — everything she had — while the others gave out of their abundance.",
        "answer": "she gave out of her poverty — her whole livelihood — while others gave from their surplus",
        "variants": ["she gave all she had unlike the rich who gave from excess", "the widow gave everything she had to live on", "others gave surplus but she gave out of her want — all her living"],
        "vocab": [{"term": "temple cleansing", "definition": "Jesus' overturning of the money changers' tables in Mark 11; combined with his cursing of the fig tree, it frames Jerusalem's coming judgment for barren religion"}, {"term": "Olivet Discourse", "definition": "Jesus' teaching in Mark 13 about the destruction of the temple and signs before the end; it warns disciples to watch and persevere in an age of tribulation"}]
    },
    "ntf02_lesson_10": {
        "course": "new-testament-foundations-02-mark",
        "q": "Review question: What did the Roman centurion say when Jesus died on the cross in Mark 15? Answer: Truly this man was the Son of God.",
        "answer": "Truly this man was the Son of God",
        "variants": ["surely this man was the son of god", "the centurion confessed — this man was truly the son of god", "a gentile soldier declared him son of god at his death"],
        "vocab": [{"term": "centurion's confession", "definition": "The statement of the Roman soldier in Mark 15:39 — Truly this man was the Son of God — the first human in Mark to confess Jesus' identity fully, and significantly a Gentile"}, {"term": "empty tomb", "definition": "The ending of Mark in 16:1-8 where the women find the stone rolled away; the oldest manuscripts end abruptly with the women fleeing in fear, leaving the resurrection as something the reader must reckon with"}]
    },
    # ── LUKE ───────────────────────────────────────────────────────────────
    "ntf03_lesson_01": {
        "course": "new-testament-foundations-03-luke",
        "q": "Review question: What is the name of the hymn Mary sings in Luke 1:46-55, and what is its central theme? Answer: the Magnificat; Mary praises God for reversing social order — exalting the humble and filling the hungry.",
        "answer": "the Magnificat; God exalts the humble and reverses the proud and powerful",
        "variants": ["mary's song called the magnificat celebrating God's reversal", "the magnificat — god brings down the mighty and raises the lowly", "the song of mary in luke 1 — god's reversal of social order"],
        "vocab": [{"term": "Magnificat", "definition": "Mary's hymn of praise in Luke 1:46-55 echoing Hannah's prayer in 1 Samuel 2; it declares God's reversal of social order — the humble exalted and the mighty brought down"}, {"term": "Zechariah", "definition": "The priest and father of John the Baptist who was struck mute for unbelief and then sang the Benedictus in Luke 1:67-79 at John's birth"}]
    },
    "ntf03_lesson_02": {
        "course": "new-testament-foundations-03-luke",
        "q": "Review question: What is the content of John the Baptist's call to repentance in Luke 3? Answer: bear fruits in keeping with repentance; do not rely on Abrahamic descent but demonstrate changed conduct in sharing, honesty, and fairness.",
        "answer": "bear fruits of repentance — share, be honest, and do not rely on being Abraham's descendants",
        "variants": ["repentance shown in practical ethics — sharing clothing and food, not extorting", "john called for concrete ethical change as evidence of true repentance", "fruits worthy of repentance — practical justice not just religious claim"],
        "vocab": [{"term": "repentance", "definition": "A turning from sin to God; in Luke 3, John's call to repentance requires concrete ethical change, not merely emotional regret or religious heritage"}, {"term": "Benedictus", "definition": "Zechariah's prophetic hymn in Luke 1:67-79 at John's birth; it blesses God for raising up a horn of salvation from David's house and John's role as the prophet going before the Lord"}]
    },
    "ntf03_lesson_03": {
        "course": "new-testament-foundations-03-luke",
        "q": "Review question: What text did Jesus read in the Nazareth synagogue, and what did he say about it? Answer: Isaiah 61:1-2 — the Spirit of the Lord is upon me to proclaim good news to the poor. Jesus said today this Scripture is fulfilled in your hearing.",
        "answer": "Isaiah 61:1-2 — today this Scripture is fulfilled in your hearing",
        "variants": ["he read Isaiah 61 and declared it fulfilled that day", "the spirit of the Lord is upon me — and jesus said today this is fulfilled", "luke 4 — jesus reads isaiah 61 and announces its fulfillment"],
        "vocab": [{"term": "Nazareth manifesto", "definition": "Jesus' reading of Isaiah 61 and declaration of fulfillment in Luke 4; it defines his mission as proclaiming good news to the poor, freedom to captives, and the year of the Lord's favor"}, {"term": "year of the Lord's favor", "definition": "The Jubilee language of Isaiah 61:2 that Jesus applies to his ministry in Luke 4; it signals liberation, restoration, and the arrival of God's kingdom"}]
    },
    "ntf03_lesson_04": {
        "course": "new-testament-foundations-03-luke",
        "q": "Review question: What are the four beatitudes Jesus pronounces in Luke 6, and to whom does he direct them? Answer: blessed are the poor, the hungry, those who weep, and those who are hated; he directs them to his disciples.",
        "answer": "poor, hungry, weeping, and hated — Jesus pronounces blessing on these four groups",
        "variants": ["the four beatitudes in luke: poor, hungry, weeping, persecuted", "blessed are the poor the hungry those who weep and those hated for the son of man", "luke's beatitudes focus on the materially poor and those who suffer"],
        "vocab": [{"term": "Sermon on the Plain", "definition": "Luke's version of Jesus' great ethical teaching in 6:17-49, parallel to Matthew's Sermon on the Mount; it begins with four beatitudes and four woes and emphasizes love of enemies"}, {"term": "love of enemies", "definition": "Jesus' command in Luke 6:27-36 to love, do good to, and pray for enemies; the most radical ethical demand of the Sermon on the Plain and the mark of God's children"}]
    },
    "ntf03_lesson_05": {
        "course": "new-testament-foundations-03-luke",
        "q": "Review question: What did Jesus say about the faith of the Roman centurion who asked him to heal his servant? Answer: I have not found such great faith even in Israel.",
        "answer": "I have not found such great faith even in Israel",
        "variants": ["not even in israel have i found such faith", "Jesus marveled and said no one in israel had faith like this centurion", "even in Israel I have not found faith this great"],
        "vocab": [{"term": "centurion's faith", "definition": "The Roman officer's trust in Luke 7 that Jesus need only speak a word and his servant would be healed; Jesus commends it as greater than any he found in Israel, foreshadowing Gentile inclusion"}, {"term": "raising of the widow's son", "definition": "The miracle in Luke 7:11-17 where Jesus raises a widow's only son at Nain; it echoes Elijah's miracle and confirms Jesus as the great prophet who has come"}]
    },
    "ntf03_lesson_06": {
        "course": "new-testament-foundations-03-luke",
        "q": "Review question: What is the Parable of the Sower teaching in Luke 8 about the different responses to God's word? Answer: the seed is God's word; the soils represent different hearers — those on the path, rocks, thorns, and good soil who hear and retain it with patience.",
        "answer": "the soils represent different hearers of the word — only those who hear and hold fast to it in patience bear fruit",
        "variants": ["four soils — path, rock, thorns, and good ground — four responses to God's word", "the seed of God's word produces fruit only in those who receive and keep it", "luke 8 parable — good soil hears holds and patiently bears fruit"],
        "vocab": [{"term": "lamp under a basket", "definition": "The teaching in Luke 8:16 following the parable of the sower; what is hidden will be revealed — the disciples receive the mystery of the kingdom to illuminate others"}, {"term": "calming of the storm", "definition": "The miracle in Luke 8:22-25 where Jesus rebukes the wind and waves; the disciples ask who this is that even wind and water obey — a question pointing to Jesus' divine identity"}]
    },
    "ntf03_lesson_07": {
        "course": "new-testament-foundations-03-luke",
        "q": "Review question: What did Peter confess when Jesus asked who the disciples believed him to be? Answer: The Christ of God.",
        "answer": "The Christ of God",
        "variants": ["peter said you are the christ of god", "the Messiah — peter's confession in luke 9", "you are God's chosen messiah"],
        "vocab": [{"term": "transfiguration", "definition": "The event in Luke 9:28-36 where Jesus' appearance changed and Moses and Elijah appeared with him; they spoke of his departure (literally exodus) he was about to accomplish in Jerusalem"}, {"term": "feeding of the five thousand", "definition": "The miracle in Luke 9:10-17 where Jesus feeds the crowd with five loaves and two fish; Luke sets it near the time of the great confession, linking Jesus' provision with his messianic identity"}]
    },
    "ntf03_lesson_08": {
        "course": "new-testament-foundations-03-luke",
        "q": "Review question: What did Jesus say was the great commandment in Luke 10 when the lawyer tested him? Answer: love the LORD your God with all your heart, soul, strength, and mind, and love your neighbor as yourself.",
        "answer": "love the LORD your God with all your heart, soul, strength, and mind, and love your neighbor as yourself",
        "variants": ["the great commandment — total love for God and love neighbor as yourself", "heart soul strength mind directed to God, and neighbor love equal to self-love", "love god completely and love your neighbor as yourself"],
        "vocab": [{"term": "Good Samaritan", "definition": "The parable in Luke 10:25-37 answering who is my neighbor; a Samaritan shows mercy to a beaten man where priests and Levites passed by — defining neighbor not by ethnicity but by merciful action"}, {"term": "Mary and Martha", "definition": "The account in Luke 10:38-42 where Mary sits at Jesus' feet while Martha is distracted with serving; Jesus says Mary has chosen the better part — the image of a woman as a disciple sitting at a rabbi's feet was culturally unusual"}]
    },
    "ntf03_lesson_09": {
        "course": "new-testament-foundations-03-luke",
        "q": "Review question: What does Jesus say in Luke 12 is the thing not to fear — and the thing to fear? Answer: do not fear those who can kill the body; fear him who has authority to cast into hell.",
        "answer": "fear God who can cast into hell, not those who can only kill the body",
        "variants": ["do not fear those who kill the body — fear him who has authority over body and soul", "jesus says real fear belongs to God not human persecutors", "fear the one who has authority over your eternal destiny — not physical threats"],
        "vocab": [{"term": "parable of the rich fool", "definition": "The parable in Luke 12:13-21 about the man who planned bigger barns but died suddenly; it warns against storing up earthly treasure while not being rich toward God"}, {"term": "watchfulness", "definition": "The call in Luke 12:35-48 to be like servants ready for their master's return; it introduces themes of judgment and faithful stewardship that continue through Luke's journey narrative"}]
    },
    "ntf03_lesson_10": {
        "course": "new-testament-foundations-03-luke",
        "q": "Review question: What is the central theme of the three parables in Luke 15? Answer: the joy of God over one sinner who repents — the lost sheep, the lost coin, and the lost son all end in celebration of recovery.",
        "answer": "God's joy over one sinner who repents — the lost is found and there is celebration",
        "variants": ["all three parables end with rejoicing over what was lost being found", "God's passionate pursuit of the lost and the joy of their restoration", "the theme is recovery and celebration — lost sheep, lost coin, lost son all found"],
        "vocab": [{"term": "parable of the prodigal son", "definition": "The third parable in Luke 15, also called the parable of the two sons; the father runs to meet the returning son and celebrates, while the elder son refuses to join — both are told to an audience of Pharisees and sinners"}, {"term": "tax collectors and sinners", "definition": "The audience with whom Jesus ate and who gathered to hear him in Luke 15:1; the Pharisees' complaint about this association prompted the three parables of the lost"}]
    },
    "ntf03_lesson_11": {
        "course": "new-testament-foundations-03-luke",
        "q": "Review question: What did Jesus say about the one who is faithful in very little in Luke 16? Answer: whoever is faithful in very little is also faithful in much, and whoever is dishonest in very little is also dishonest in much.",
        "answer": "whoever is faithful in little is faithful in much; dishonesty in small things reveals dishonesty in large ones",
        "variants": ["faithfulness in small things proves faithfulness in large ones", "you cannot serve God and money — the one who is faithful in little is trusted with much", "luke 16 — small faithfulness is the test for greater responsibility"],
        "vocab": [{"term": "Lazarus and the rich man", "definition": "The account in Luke 16:19-31 of the rich man who ignored the beggar at his gate; after death, roles are permanently reversed and the rich man is told even a resurrection would not persuade those who reject Moses and the Prophets"}, {"term": "mammon", "definition": "An Aramaic word for wealth used in Luke 16:13; Jesus' statement that no servant can serve both God and mammon establishes the radical claim of God's ownership over all of life"}]
    },
    "ntf03_lesson_12": {
        "course": "new-testament-foundations-03-luke",
        "q": "Review question: What did Jesus say about the Pharisee and the tax collector who went to the temple to pray? Answer: the tax collector — not the Pharisee — went home justified, because everyone who exalts himself will be humbled.",
        "answer": "the tax collector went home justified, not the Pharisee — because God humbles the proud and exalts the humble",
        "variants": ["the pharisee boasted and was not justified; the tax collector cried for mercy and was", "god is near the broken not the self-righteous — the tax collector was accepted", "the humble prayer of the tax collector was heard; the pharisee's was not"],
        "vocab": [{"term": "parable of the Pharisee and tax collector", "definition": "The parable in Luke 18:9-14 addressed to those who trusted in their righteousness; the tax collector's cry for mercy — God have mercy on me a sinner — becomes a model of humble prayer"}, {"term": "Zacchaeus", "definition": "The chief tax collector in Jericho in Luke 19 who climbed a tree to see Jesus; Jesus' visit to his home and his subsequent pledge of restitution illustrate that the Son of Man came to seek and save the lost"}]
    },
    "ntf03_lesson_13": {
        "course": "new-testament-foundations-03-luke",
        "q": "Review question: What did Jesus say would happen to Jerusalem and the temple in Luke 21? Answer: the temple would be destroyed so that not one stone would be left on another, as part of a time of great tribulation.",
        "answer": "the temple would be completely destroyed — not one stone left on another",
        "variants": ["not one stone upon another would remain — the temple's total destruction", "Jesus foretold the temple's destruction in Luke 21", "the days of vengeance would bring the temple's complete ruin"],
        "vocab": [{"term": "Olivet Discourse in Luke", "definition": "Jesus' teaching on the temple's destruction and the end in Luke 21; Luke's version emphasizes the destruction of Jerusalem in AD 70 and warns disciples to stand firm and not be misled"}, {"term": "widow's offering", "definition": "The account in Luke 21:1-4 of the poor widow who gave two small coins; Jesus says she gave more than all others because she gave out of her poverty while they gave from surplus — immediately followed by the temple destruction discourse"}]
    },
    "ntf03_lesson_14": {
        "course": "new-testament-foundations-03-luke",
        "q": "Review question: Where does Luke's Gospel end, and what does Jesus command the disciples to wait for? Answer: Jerusalem; Jesus commands them to wait there for the promise of the Father — power from on high.",
        "answer": "Jerusalem; they are to wait for the promise of the Father — power from on high",
        "variants": ["they return to Jerusalem to wait for the holy spirit", "jesus tells them to stay in jerusalem until clothed with power from on high", "the disciples return to jerusalem in great joy awaiting the promise"],
        "vocab": [{"term": "Emmaus road", "definition": "The journey in Luke 24:13-35 where Jesus walked unrecognized with two disciples and explained the Scriptures before being revealed in the breaking of bread — a pattern of Word and table"}, {"term": "promise of the Father", "definition": "Jesus' final command in Luke 24:49 to wait in Jerusalem for the Holy Spirit; this promise is fulfilled in Acts 2 and connects Luke's Gospel to his second volume"}]
    },
    # ── JOHN ───────────────────────────────────────────────────────────────
    "ntf04_lesson_01": {
        "course": "new-testament-foundations-04-john",
        "q": "Review question: What does John 1:14 say about the Word? Answer: the Word became flesh and dwelt among us, and we have seen his glory, glory as of the only Son from the Father, full of grace and truth.",
        "answer": "the Word became flesh and dwelt among us, full of grace and truth",
        "variants": ["the word became flesh and tabernacled among us", "john 1:14 — the logos became flesh and we beheld his glory", "the eternal word took on human nature and lived among us"],
        "vocab": [{"term": "Logos", "definition": "Greek for word; John 1:1 identifies Jesus as the Logos — the eternal, personal word through whom all things were made and who became flesh in the incarnation"}, {"term": "incarnation", "definition": "The theological term for God the Son taking on human nature; John 1:14 states the Word became flesh — not merely appeared human but genuinely became human while remaining divine"}]
    },
    "ntf04_lesson_02": {
        "course": "new-testament-foundations-04-john",
        "q": "Review question: What did Jesus tell Nicodemus was required to see the kingdom of God? Answer: he must be born again — born of water and the Spirit.",
        "answer": "he must be born again — born of water and the Spirit",
        "variants": ["unless a man is born again he cannot see the kingdom of god", "born of water and spirit — new birth from above is required", "you must be born anew — the conversation with nicodemus in john 3"],
        "vocab": [{"term": "born again", "definition": "Jesus' teaching to Nicodemus in John 3 that entry into the kingdom requires a new birth from above by the Spirit; the Greek can mean again or from above, capturing both renewal and divine origin"}, {"term": "lifting up", "definition": "Jesus' prediction in John 3:14-15 that the Son of Man must be lifted up as Moses lifted the serpent; a double meaning in John referring to both crucifixion and exaltation"}]
    },
    "ntf04_lesson_03": {
        "course": "new-testament-foundations-04-john",
        "q": "Review question: What did Jesus offer the Samaritan woman at the well that would permanently satisfy her thirst? Answer: living water — a spring welling up to eternal life.",
        "answer": "living water — a spring welling up to eternal life",
        "variants": ["water that would become a spring of water welling up to eternal life", "living water that ends all thirst permanently", "the woman's thirst for eternal life met with Christ's gift of living water"],
        "vocab": [{"term": "living water", "definition": "Jesus' offer to the Samaritan woman in John 4; it refers to the Holy Spirit (John 7:37-39) who satisfies the deepest spiritual thirst permanently"}, {"term": "worship in spirit and truth", "definition": "Jesus' teaching in John 4:23-24 that the new era of worship is not tied to mountains or temples but offered to the Father through the Spirit and in conformity with truth"}]
    },
    "ntf04_lesson_04": {
        "course": "new-testament-foundations-04-john",
        "q": "Review question: What did Jesus say about the relationship between his work and the Father's work in John 5? Answer: the Son can do nothing on his own; he does only what he sees the Father doing, and the Father shows the Son all he does.",
        "answer": "the Son does only what he sees the Father doing — they work in perfect unity",
        "variants": ["the son does nothing apart from the father — the father shows the son all he does", "perfect dependence and unity: whatever the father does, the son does likewise", "john 5 — the son acts in complete submission and unity with the father"],
        "vocab": [{"term": "Sabbath healing", "definition": "The healing of the invalid at the Pool of Bethesda in John 5, done on the Sabbath; it provokes controversy and leads to the discourse on the Son's authority — greater than the Sabbath"}, {"term": "five witnesses", "definition": "The five testimonies Jesus lists in John 5:31-47 confirming his identity: John the Baptist, his works, the Father, the Scriptures, and Moses"}]
    },
    "ntf04_lesson_05": {
        "course": "new-testament-foundations-04-john",
        "q": "Review question: What does Jesus call himself in the Bread of Life discourse in John 6? Answer: I am the bread of life; whoever comes to me shall not hunger and whoever believes in me shall never thirst.",
        "answer": "I am the bread of life — whoever comes to me will never hunger or thirst",
        "variants": ["the bread of life — I am the living bread come down from heaven", "jesus declares I am the bread of life in john 6", "the first I AM declaration — bread that gives life to the world"],
        "vocab": [{"term": "I AM declarations", "definition": "The seven absolute I AM statements in John's Gospel where Jesus identifies himself with divine predicates; the first is I am the bread of life in John 6:35"}, {"term": "eating my flesh and drinking my blood", "definition": "Jesus' hard teaching in John 6:53-56 that provoked many disciples to leave; interpreted as demanding full participation in his death — trusting completely in his atoning sacrifice"}]
    },
    "ntf04_lesson_06": {
        "course": "new-testament-foundations-04-john",
        "q": "Review question: What does Jesus declare about himself in John 8:58 that provoked the crowd to pick up stones? Answer: Before Abraham was, I am.",
        "answer": "Before Abraham was, I am",
        "variants": ["I AM — before Abraham existed I eternally am", "john 8:58 — before abraham was born I am — claiming divine existence", "the absolute I AM statement implying eternal divine identity before Abraham"],
        "vocab": [{"term": "I am the light of the world", "definition": "Jesus' declaration in John 8:12 claiming to be the source of spiritual illumination; it echoes Genesis 1 and the pillar of fire in Exodus and leads to the healing of a blind man in chapter 9"}, {"term": "Before Abraham was, I am", "definition": "Jesus' statement in John 8:58 using the absolute I AM (ego eimi) that echoes God's self-designation in Exodus 3:14; the crowd understood it as a claim to divinity and attempted to stone him"}]
    },
    "ntf04_lesson_07": {
        "course": "new-testament-foundations-04-john",
        "q": "Review question: What does Jesus say the Good Shepherd does that distinguishes him from a hired hand? Answer: the Good Shepherd lays down his life for the sheep.",
        "answer": "the Good Shepherd lays down his life for the sheep",
        "variants": ["he dies for his sheep — the hired hand flees but the shepherd gives his life", "the shepherd sacrifices himself for the sheep while the hireling abandons them", "I am the good shepherd who lays down his life for the sheep"],
        "vocab": [{"term": "Good Shepherd", "definition": "Jesus' self-designation in John 10 drawing on Psalm 23 and Ezekiel 34; he knows his sheep, they hear his voice, and he willingly lays down his life — the language of atonement and covenant care"}, {"term": "sheepfold", "definition": "The enclosure in John 10 where the shepherd enters by the door; Jesus declares himself both the door and the shepherd, distinguishing legitimate leadership from those who climb in by other means"}]
    },
    "ntf04_lesson_08": {
        "course": "new-testament-foundations-04-john",
        "q": "Review question: What does Jesus say to Martha before raising Lazarus? Answer: I am the resurrection and the life; whoever believes in me, though he die, yet shall he live.",
        "answer": "I am the resurrection and the life — whoever believes in me, though he die, yet shall he live",
        "variants": ["I am the resurrection and the life — john 11:25", "he who believes in me will live even though he dies", "the fifth I AM — jesus is the resurrection itself not merely a means to it"],
        "vocab": [{"term": "resurrection and the life", "definition": "Jesus' declaration in John 11:25 — the fifth I AM statement; Jesus claims not merely to give resurrection but to be the source of resurrection and life itself"}, {"term": "Jesus wept", "definition": "John 11:35 — the shortest verse in Scripture; Jesus' tears at Lazarus's tomb reveal genuine grief alongside divine power, confirming his full humanity in the face of death"}]
    },
    "ntf04_lesson_09": {
        "course": "new-testament-foundations-04-john",
        "q": "Review question: What did Jesus say about the grain of wheat in John 12:24? Answer: unless a grain of wheat falls into the earth and dies, it remains alone; but if it dies, it bears much fruit.",
        "answer": "unless a grain of wheat dies it remains alone; dying it bears much fruit",
        "variants": ["a seed must die to bear fruit — jesus applies this to his own death", "john 12:24 — death precedes fruitfulness", "the grain of wheat must fall and die — a picture of jesus and of discipleship"],
        "vocab": [{"term": "triumphal entry", "definition": "Jesus' entry into Jerusalem on a donkey in John 12:12-19, fulfilling Zechariah 9:9; the crowd's hosannas signal their expectation of a political messiah that Jesus will redefine through the cross"}, {"term": "hour of glory", "definition": "The phrase in John 12 marking the arrival of the time Jesus had repeatedly said had not yet come; the hour of the cross is the hour of glorification in John's theology"}]
    },
    "ntf04_lesson_10": {
        "course": "new-testament-foundations-04-john",
        "q": "Review question: What new commandment does Jesus give his disciples in John 13? Answer: love one another as I have loved you.",
        "answer": "love one another as I have loved you",
        "variants": ["a new commandment — love one another the way I have loved you", "john 13:34 — the new commandment of mutual love modeled on Christ's love", "love as I have loved — the standard is Christ's self-giving love"],
        "vocab": [{"term": "foot washing", "definition": "Jesus' act in John 13:1-17 of washing the disciples' feet before the Passover; it models servant love and illustrates the cleansing Jesus will accomplish through his death"}, {"term": "Paraclete", "definition": "The Greek term meaning helper, advocate, or comforter used in John 14-16 for the Holy Spirit; Jesus promises the Spirit will come after his departure to teach, remind, convict, and guide the disciples"}]
    },
    "ntf04_lesson_11": {
        "course": "new-testament-foundations-04-john",
        "q": "Review question: What does Jesus say is the condition for bearing fruit in John 15? Answer: abiding in him — remaining in him as a branch in a vine.",
        "answer": "abiding in him — remaining in him as a branch remains in the vine",
        "variants": ["remaining in Christ like a branch in the vine — the condition for bearing fruit", "john 15 — abide in me and I in you; apart from me you can do nothing", "the vine and branches — fruit requires remaining connected to Christ"],
        "vocab": [{"term": "vine and branches", "definition": "The I AM statement in John 15:1 — I am the true vine; abiding in Jesus is the only source of spiritual fruitfulness — branches that do not abide are cut off"}, {"term": "High Priestly Prayer", "definition": "Jesus' prayer in John 17 for himself, his disciples, and all future believers; he prays for their unity, protection from evil, and sanctification in the truth — the longest recorded prayer of Jesus"}]
    },
    "ntf04_lesson_12": {
        "course": "new-testament-foundations-04-john",
        "q": "Review question: What does John state as his purpose for writing the Gospel in John 20:30-31? Answer: so that you may believe that Jesus is the Christ, the Son of God, and that by believing you may have life in his name.",
        "answer": "that you may believe Jesus is the Christ the Son of God and have life in his name",
        "variants": ["written so readers will believe jesus is the messiah and receive eternal life", "john 20:31 — the stated purpose: belief in the son of god leading to life", "that you may believe and have life — the gospel's own purpose statement"],
        "vocab": [{"term": "doubting Thomas", "definition": "The account in John 20:24-29 where Thomas refuses to believe the resurrection until he sees Jesus; his confession My Lord and my God is the highest Christological statement in John's Gospel"}, {"term": "restoration of Peter", "definition": "The scene in John 21 where Jesus asks Peter three times do you love me, corresponding to Peter's three denials; each affirmation is met with a commission to feed and tend Jesus' sheep"}]
    },
    # ── ACTS ───────────────────────────────────────────────────────────────
    "ntf05_lesson_01": {
        "course": "new-testament-foundations-05-acts",
        "q": "Review question: What geographical outline does Jesus give in Acts 1:8 for the spread of the gospel? Answer: Jerusalem, Judea and Samaria, and to the ends of the earth.",
        "answer": "Jerusalem, Judea and Samaria, and to the ends of the earth",
        "variants": ["acts 1:8 — jerusalem then judea and samaria then the whole world", "from jerusalem outward to samaria and to the ends of the earth", "the three-stage mission: local, regional, worldwide"],
        "vocab": [{"term": "ascension", "definition": "Jesus' departure into heaven in Acts 1:9-11; the cloud received him from sight and angels promised his visible return — the ascension begins the era of the Spirit and the church's mission"}, {"term": "Acts 1:8 outline", "definition": "The geographic program of Acts — Jerusalem (chapters 1-7), Judea and Samaria (8-12), and ends of the earth (13-28); scholars note Rome as Luke's symbol for the empire's extremity"}]
    },
    "ntf05_lesson_02": {
        "course": "new-testament-foundations-05-acts",
        "q": "Review question: What is Peter's answer when the crowd asks what they must do in Acts 2:38? Answer: repent and be baptized, every one of you, in the name of Jesus Christ for the forgiveness of your sins, and you will receive the gift of the Holy Spirit.",
        "answer": "repent and be baptized in Jesus' name for forgiveness of sins, and receive the Holy Spirit",
        "variants": ["repent, be baptized in Christ's name, receive forgiveness and the holy spirit", "acts 2:38 — repentance, baptism, and the gift of the spirit", "peter calls for repentance and baptism as response to pentecost"],
        "vocab": [{"term": "Pentecost", "definition": "The Jewish harvest festival fifty days after Passover; Acts 2 records the outpouring of the Holy Spirit with wind, fire, and tongues, fulfilling Joel 2 and Jesus' promise in Acts 1:8"}, {"term": "speaking in tongues", "definition": "The miraculous speech at Pentecost in Acts 2 where each person heard in their own language; it reverses Babel's confusion and signals the gospel going to all nations"}]
    },
    "ntf05_lesson_03": {
        "course": "new-testament-foundations-05-acts",
        "q": "Review question: What is the name Peter gives to the lame man after healing him in Acts 3? Answer: he is healed not in Peter's name but in the name of Jesus Christ of Nazareth.",
        "answer": "healed in the name of Jesus Christ of Nazareth",
        "variants": ["in the name of jesus christ of nazareth rise and walk", "peter heals by the authority of jesus name not his own", "acts 3 — silver and gold I have not but in jesus name walk"],
        "vocab": [{"term": "Beautiful Gate", "definition": "The temple entrance where Peter and John healed the lame man in Acts 3; the miracle drew a crowd to the temple courts and provided the occasion for Peter's sermon"}, {"term": "Peter's sermon in Acts 3", "definition": "Peter's address after the healing attributing the miracle to the glorified Jesus; he calls Israel to repentance and points to the prophets who foretold the Christ's suffering and return"}]
    },
    "ntf05_lesson_04": {
        "course": "new-testament-foundations-05-acts",
        "q": "Review question: Why did Ananias and Sapphira die in Acts 5? Answer: they lied to the Holy Spirit by keeping back part of the money from a land sale while pretending to give the full amount.",
        "answer": "they lied to the Holy Spirit by claiming to give all while secretly keeping part",
        "variants": ["they deceived the holy spirit about the proceeds of their land", "ananias and sapphira kept part of the sale price but pretended to give all — they lied to god", "acts 5 — deceit before god about the offering amount"],
        "vocab": [{"term": "Ananias and Sapphira", "definition": "The couple in Acts 5 who died for lying to the Holy Spirit about their offering; their story follows the generosity of Barnabas and establishes the seriousness of hypocrisy in the community"}, {"term": "Stephen", "definition": "The first Christian martyr in Acts 7 whose speech before the Sanhedrin traced Israel's history of rejecting God's messengers; his stoning introduced Saul of Tarsus and scattered the Jerusalem church outward"}]
    },
    "ntf05_lesson_05": {
        "course": "new-testament-foundations-05-acts",
        "q": "Review question: What did Jesus say to Saul on the Damascus road when Saul asked who was speaking? Answer: I am Jesus, whom you are persecuting.",
        "answer": "I am Jesus, whom you are persecuting",
        "variants": ["I am Jesus whom you persecute", "the voice said I am Jesus — confronting saul on the road to damascus", "acts 9 — jesus identifies himself to the persecutor saul"],
        "vocab": [{"term": "Damascus road", "definition": "The location of Saul's conversion in Acts 9; blinded by a light from heaven, Saul fell and heard Jesus identify himself — transforming the chief persecutor into the apostle to the Gentiles"}, {"term": "Philip the evangelist", "definition": "One of the seven deacons who preached in Samaria and explained Isaiah 53 to the Ethiopian eunuch in Acts 8; his ministry shows the gospel crossing ethnic and geographic boundaries"}]
    },
    "ntf05_lesson_06": {
        "course": "new-testament-foundations-05-acts",
        "q": "Review question: What did Peter's vision of the unclean animals in Acts 10 teach him? Answer: do not call anything impure that God has made clean — the vision prepared him to accept Cornelius, a Gentile.",
        "answer": "do not call anything impure that God has made clean — applied to accepting Gentiles",
        "variants": ["god has made clean what you call impure — the vision prepared peter for cornelius", "the vision overturned food laws as a sign that no person should be called unclean", "acts 10 — the sheet vision meant gentiles are not to be excluded"],
        "vocab": [{"term": "Cornelius", "definition": "The Roman centurion in Acts 10 whose household received the Holy Spirit before baptism; Peter's visit to him and the Spirit's outpouring convinced the Jerusalem church that God had accepted Gentiles"}, {"term": "Jerusalem Council", "definition": "The gathering in Acts 15 that decided Gentile believers did not need to be circumcised; it established that salvation is by grace alone through faith — the first major doctrinal decision of the church"}]
    },
    "ntf05_lesson_07": {
        "course": "new-testament-foundations-05-acts",
        "q": "Review question: What happened when Paul and Barnabas were sent out from Antioch in Acts 13? Answer: the Holy Spirit directed the church to set them apart and send them; they were commissioned by prayer and laying on of hands.",
        "answer": "the Holy Spirit commanded them to set apart Paul and Barnabas for mission; the church prayed and sent them",
        "variants": ["the spirit said set apart paul and barnabas for the work — the church prayed and sent them", "acts 13 — spirit-directed commissioning of the first missionary journey from antioch", "the antioch church fasted, prayed, laid hands on them and sent them"],
        "vocab": [{"term": "first missionary journey", "definition": "Paul and Barnabas's mission in Acts 13-14 through Cyprus, Pisidian Antioch, Iconium, Lystra, and Derbe; they established churches and returned to Antioch before the Jerusalem Council"}, {"term": "Antioch", "definition": "The Syrian city where disciples were first called Christians; it became the mission base for Paul's three journeys and modeled a multiethnic community led by prophets and teachers"}]
    },
    "ntf05_lesson_08": {
        "course": "new-testament-foundations-05-acts",
        "q": "Review question: What did the Jerusalem Council decide about circumcision and Gentile believers in Acts 15? Answer: Gentile believers are not required to be circumcised; they need only abstain from food sacrificed to idols, blood, strangled animals, and sexual immorality.",
        "answer": "Gentiles need not be circumcised; they should only abstain from idols, blood, strangled meat, and sexual immorality",
        "variants": ["no circumcision required for gentiles — james announced four abstentions only", "acts 15 council: grace alone — four minimal requirements for table fellowship", "the decree from jerusalem: gentiles accepted without circumcision"],
        "vocab": [{"term": "circumcision party", "definition": "Jewish believers who insisted Gentile converts must be circumcised and keep the Mosaic law; their position prompted the Jerusalem Council and is refuted in Acts 15 and Galatians"}, {"term": "Paul and Silas", "definition": "The missionary pair in Acts 15-18 after Paul and Barnabas separated; Silas joined Paul for the second journey through Macedonia, Philippi, Thessalonica, Berea, Athens, and Corinth"}]
    },
    "ntf05_lesson_09": {
        "course": "new-testament-foundations-05-acts",
        "q": "Review question: What did Paul say when the Athenians wanted to know about the unknown god in Acts 17? Answer: Paul declared him — the God who made the world and everything in it, Lord of heaven and earth, who gives all people life and breath.",
        "answer": "the God who made the world and everything in it — Lord of heaven and earth who gives all life",
        "variants": ["paul revealed the unknown god as creator of all who gives life to all people", "acts 17 — the god who made everything does not live in temples made by hands", "the god behind the unknown altar is the creator and sustainer of all things"],
        "vocab": [{"term": "Areopagus speech", "definition": "Paul's address to Athenian philosophers in Acts 17:22-31; he begins with their altar to an unknown god and proclaims the creator God, resurrection, and coming judgment — meeting his audience on their own ground"}, {"term": "Bereans", "definition": "The Jews in Acts 17:11 who received Paul's message with eagerness and examined the Scriptures daily to verify his claims; held as a model of noble, critical engagement with preaching"}]
    },
    "ntf05_lesson_10": {
        "course": "new-testament-foundations-05-acts",
        "q": "Review question: What did Paul tell the Ephesian elders was the task he had received from the Lord Jesus in Acts 20? Answer: to testify to the gospel of God's grace.",
        "answer": "to testify to the gospel of God's grace",
        "variants": ["to finish the task of testifying to the gospel of grace", "acts 20 — paul says his life's work is witnessing to god's grace", "the task given by jesus — bear witness to the gospel of grace"],
        "vocab": [{"term": "Ephesus", "definition": "The major city where Paul spent three years in Acts 19-20; the gospel's advance there disrupted the silversmiths who made shrines for Artemis, illustrating the social and economic impact of the gospel"}, {"term": "farewell to Ephesian elders", "definition": "Paul's speech in Acts 20:17-38 — the only speech addressed to Christians in Acts; he commissions the elders to guard the flock from wolves and commends them to God and the word of his grace"}]
    },
    "ntf05_lesson_11": {
        "course": "new-testament-foundations-05-acts",
        "q": "Review question: What was Paul's defense before Felix in Acts 24? Answer: Paul denied all charges of stirring up trouble and affirmed he believed everything written in the Law and Prophets, hoping in the resurrection of both just and unjust.",
        "answer": "Paul denied trouble-making and affirmed belief in resurrection and the Law and Prophets",
        "variants": ["paul denied the charges and declared his hope in resurrection from the dead", "he worshipped the God of his ancestors and believed the prophets and resurrection", "acts 24 — paul's defense: fulfillment of the jewish hope including resurrection"],
        "vocab": [{"term": "Paul's imprisonment", "definition": "Paul's custody in Caesarea in Acts 24-26 and then in Rome in Acts 27-28; his imprisonments provide opportunities for defense speeches before Felix, Festus, Agrippa, and eventually in Rome"}, {"term": "Agrippa", "definition": "King Agrippa II before whom Paul gave his defense in Acts 26; Paul's account of his conversion and mission prompted Agrippa's famous reply — almost you persuade me to be a Christian"}]
    },
    "ntf05_lesson_12": {
        "course": "new-testament-foundations-05-acts",
        "q": "Review question: How does the book of Acts end, and what is Paul doing? Answer: Paul is in Rome under house arrest, boldly proclaiming the kingdom of God and teaching about Jesus with no one hindering him.",
        "answer": "Paul in Rome under house arrest, openly proclaiming the kingdom of God and teaching about Jesus",
        "variants": ["acts ends with paul in rome preaching freely and without hindrance", "the gospel reaches rome — paul teaches boldly though under arrest", "acts 28 — paul proclaims the kingdom in rome with boldness and without obstacle"],
        "vocab": [{"term": "Rome", "definition": "The final destination of Acts and the center of the empire; Paul's arrival fulfills Acts 1:8 and Jesus' promise in Acts 23:11 that Paul must testify in Rome — the ends of the earth"}, {"term": "without hindrance", "definition": "The final word of Acts in Greek (akolutos) — Paul preached without hindrance; despite chains and opposition, the word of God was not chained — a triumphant ending to the gospel's advance"}]
    },
    # ── PAULINE EPISTLES ───────────────────────────────────────────────────
    "ntf06_lesson_01": {
        "course": "new-testament-foundations-06-pauline-epistles",
        "q": "Review question: What does Paul declare in Romans 1:16-17 about the gospel? Answer: he is not ashamed of it, for it is the power of God for salvation to everyone who believes, and in it God's righteousness is revealed from faith to faith.",
        "answer": "the gospel is God's power for salvation — revealing righteousness from faith to faith",
        "variants": ["I am not ashamed of the gospel — it is God's power for salvation to all who believe", "in the gospel god's righteousness is revealed from faith for faith", "romans 1:16-17 — the power of salvation by faith for all"],
        "vocab": [{"term": "righteousness of God", "definition": "The central theme of Romans; God's righteousness is both his character attribute and the gift he gives to believers through faith in Christ — declared righteous, not merely treated as if righteous"}, {"term": "apostle", "definition": "One sent with a commission; Paul identifies himself as an apostle set apart for the gospel in Romans 1:1 — establishing his authority and the divine origin of his message"}]
    },
    "ntf06_lesson_02": {
        "course": "new-testament-foundations-06-pauline-epistles",
        "q": "Review question: What does Paul say Abraham's faith was counted as in Romans 4? Answer: righteousness — Abraham believed God and it was credited to him as righteousness.",
        "answer": "righteousness — Abraham believed God and it was counted to him as righteousness",
        "variants": ["his faith was reckoned as righteousness before circumcision", "romans 4 — faith counted as righteousness for abraham as model for all believers", "genesis 15:6 — abraham believed and it was counted to him as righteousness"],
        "vocab": [{"term": "justification", "definition": "The act of God declaring a sinner righteous on the basis of Christ's righteousness received through faith; Paul develops this in Romans 3-5 as the answer to universal human guilt before a holy God"}, {"term": "imputation", "definition": "The crediting of righteousness to the believer's account; Paul quotes Genesis 15:6 in Romans 4 — faith was counted as righteousness — as the model of justification apart from works"}]
    },
    "ntf06_lesson_03": {
        "course": "new-testament-foundations-06-pauline-epistles",
        "q": "Review question: What does Paul say in Romans 8:1 about those who are in Christ Jesus? Answer: there is therefore now no condemnation for those who are in Christ Jesus.",
        "answer": "there is therefore now no condemnation for those who are in Christ Jesus",
        "variants": ["no condemnation now for those in christ", "romans 8:1 — freedom from condemnation for all who are in christ", "the great declaration — no condemnation for the believer"],
        "vocab": [{"term": "union with Christ", "definition": "Paul's phrase in Christ expressing the believer's incorporation into Jesus through faith; it governs Romans 6-8 and carries consequences of death to sin, freedom from condemnation, and the Spirit's indwelling"}, {"term": "Spirit of adoption", "definition": "The Spirit described in Romans 8:15 by whom believers cry Abba Father; adoption establishes the believer as a child and heir of God alongside Jesus"}]
    },
    "ntf06_lesson_04": {
        "course": "new-testament-foundations-06-pauline-epistles",
        "q": "Review question: What does Paul say in Romans 12:1-2 that believers should do with their bodies? Answer: present them as living sacrifices, holy and pleasing to God — this is spiritual worship; do not conform to this age but be transformed by renewing the mind.",
        "answer": "present your bodies as living sacrifices to God and be transformed by renewing your mind",
        "variants": ["offer bodies as living sacrifices and do not conform to the world", "romans 12 — living sacrifice and mind renewal as the response to God's mercy", "spiritual worship is the body presented to god and the mind transformed"],
        "vocab": [{"term": "living sacrifice", "definition": "Paul's term in Romans 12:1 for the believer's total offering of their life to God; worship extends beyond ritual to every dimension of daily embodied existence"}, {"term": "spiritual gifts in Romans 12", "definition": "The gifts Paul lists in Romans 12:6-8 including prophecy, service, teaching, exhortation, giving, leadership, and mercy; they are to be exercised with sober judgment within the body of Christ"}]
    },
    "ntf06_lesson_05": {
        "course": "new-testament-foundations-06-pauline-epistles",
        "q": "Review question: What does Paul say is foolish to God in 1 Corinthians 1? Answer: the wisdom of the world — God chose the foolish things to shame the wise and the weak things to shame the strong.",
        "answer": "the wisdom of the world is foolishness to God — he chose what is weak and foolish to shame the strong",
        "variants": ["worldly wisdom is foolishness — god's foolishness is wiser than human wisdom", "the cross appears foolish to those perishing but is God's power to those being saved", "1 corinthians 1 — god chose the weak and foolish to nullify the wise and powerful"],
        "vocab": [{"term": "word of the cross", "definition": "Paul's term in 1 Corinthians 1:18 for the gospel message about Christ crucified; it is foolishness to those perishing but the power of God to those being saved"}, {"term": "divisions at Corinth", "definition": "The factional allegiances in the Corinthian church (Paul, Apollos, Cephas, Christ) addressed in 1 Corinthians 1-4; Paul argues that boasting in human leaders contradicts the cross"}]
    },
    "ntf06_lesson_06": {
        "course": "new-testament-foundations-06-pauline-epistles",
        "q": "Review question: What does Paul say the body of a believer is in 1 Corinthians 6? Answer: a temple of the Holy Spirit who is in you, whom you have from God.",
        "answer": "a temple of the Holy Spirit who is in you — received from God",
        "variants": ["your body is the holy spirit's temple — you were bought at a price", "the body belongs to god because it is where the spirit dwells", "1 corinthians 6:19 — the body as the holy spirit's temple"],
        "vocab": [{"term": "temple of the Holy Spirit", "definition": "Paul's teaching in 1 Corinthians 6:19 that the believer's body is the dwelling place of the Spirit; it grounds Christian sexual ethics in theology rather than rules"}, {"term": "food sacrificed to idols", "definition": "The issue in 1 Corinthians 8-10 about eating meat offered to pagan gods; Paul argues that knowledge must yield to love for the weak brother whose conscience might be damaged"}]
    },
    "ntf06_lesson_07": {
        "course": "new-testament-foundations-06-pauline-epistles",
        "q": "Review question: What does Paul say in 1 Corinthians 15:17 about what would be true if Christ had not been raised? Answer: your faith is futile and you are still in your sins.",
        "answer": "if Christ is not raised your faith is futile and you are still in your sins",
        "variants": ["faith is empty and sins unforgiven if there is no resurrection", "1 corinthians 15 — without resurrection faith is vain and sin remains", "paul says the resurrection is essential — without it faith is worthless"],
        "vocab": [{"term": "resurrection in 1 Corinthians 15", "definition": "Paul's extended defense of the bodily resurrection in 1 Corinthians 15; he grounds it in eyewitness testimony, explains the future resurrection body, and declares death defeated through Christ"}, {"term": "Lord's Supper in Corinthians", "definition": "Paul's correction of the Corinthian practice in 1 Corinthians 11:17-34; some ate and drank to excess while others went hungry — a violation of the body's unity that Paul ties to eating and drinking judgment on oneself"}]
    },
    "ntf06_lesson_08": {
        "course": "new-testament-foundations-06-pauline-epistles",
        "q": "Review question: What does Paul say God does with all affliction in 2 Corinthians 1? Answer: God comforts us in all our affliction so that we may be able to comfort those who are in any affliction with the comfort we ourselves receive from God.",
        "answer": "God comforts us in affliction so we can comfort others with the same comfort we received",
        "variants": ["the comfort we receive from god equips us to comfort others in their trials", "god comforts in suffering so we can pass that comfort to those who suffer", "2 corinthians 1 — suffering and comfort are both shared with others through christ"],
        "vocab": [{"term": "thorn in the flesh", "definition": "Paul's unidentified affliction in 2 Corinthians 12:7-10; God refused to remove it so that his power would be made perfect in weakness — the basis for Paul's contentment in suffering"}, {"term": "treasury of weakness", "definition": "Paul's perspective in 2 Corinthians 4:7 — we have this treasure in jars of clay so the surpassing power belongs to God; weakness makes God's power more visible not less"}]
    },
    "ntf06_lesson_09": {
        "course": "new-testament-foundations-06-pauline-epistles",
        "q": "Review question: What does Paul say about the ministry of reconciliation in 2 Corinthians 5? Answer: God reconciled us to himself through Christ and gave us the ministry of reconciliation — we are ambassadors for Christ, imploring people to be reconciled to God.",
        "answer": "God reconciled us through Christ and gave us the ministry of reconciliation as his ambassadors",
        "variants": ["we are ambassadors begging people on christ's behalf to be reconciled to god", "god initiated reconciliation and made us its ministers and messengers", "2 corinthians 5 — reconciliation through christ, ambassadors imploring the world"],
        "vocab": [{"term": "reconciliation", "definition": "The restoration of a broken relationship; Paul uses it in 2 Corinthians 5 for God's act in Christ of removing the enmity between God and humanity, making peace through the cross"}, {"term": "new creation", "definition": "Paul's declaration in 2 Corinthians 5:17 — if anyone is in Christ, he is a new creation; the old has gone and the new has come — union with Christ marks the beginning of the new age"}]
    },
    "ntf06_lesson_10": {
        "course": "new-testament-foundations-06-pauline-epistles",
        "q": "Review question: What does Paul say about himself in 2 Corinthians 12:9-10 about boasting in weaknesses? Answer: he will boast in his weaknesses so that Christ's power may rest on him; when he is weak, then he is strong.",
        "answer": "he boasts in weaknesses so Christ's power rests on him — when weak, then strong",
        "variants": ["I will boast in weakness because power is made perfect in weakness", "Paul's paradox — strength through weakness when christ's power is the source", "2 corinthians 12 — weakness is the condition for christ's power"],
        "vocab": [{"term": "super-apostles", "definition": "Paul's sarcastic label in 2 Corinthians 11 for the rival preachers who boasted in status, eloquence, and signs; Paul counters by boasting in his sufferings rather than achievements"}, {"term": "power made perfect in weakness", "definition": "God's response to Paul's prayer about the thorn in 2 Corinthians 12:9 — divine strength operates through human limitation, making God's glory undeniable"}]
    },
    "ntf06_lesson_11": {
        "course": "new-testament-foundations-06-pauline-epistles",
        "q": "Review question: What does Paul say about the relationship between faith and the law in Galatians 3? Answer: the law is not opposed to the promises of God but was a guardian until Christ came, so that we could be justified by faith.",
        "answer": "the law was a guardian until Christ came — now justification is by faith, not the law",
        "variants": ["the law served as a tutor leading to Christ — faith has come and we are no longer under the guardian", "galatians 3 — the law imprisoned us until faith in christ arrived", "the law's role as guardian ended when faith in christ fulfilled its purpose"],
        "vocab": [{"term": "justification by faith alone", "definition": "Paul's central argument in Galatians 2-3 — no one is justified by works of the law but by faith in Jesus Christ; this is the theological heart of the Reformation's sola fide"}, {"term": "guardian", "definition": "The Greek paidagogos in Galatians 3:24, often translated tutor or schoolmaster; a slave who escorted children to school and maintained discipline — Paul uses it for the law's role before Christ came"}]
    },
    "ntf06_lesson_12": {
        "course": "new-testament-foundations-06-pauline-epistles",
        "q": "Review question: What is the fruit of the Spirit listed by Paul in Galatians 5? Answer: love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, and self-control.",
        "answer": "love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, and self-control",
        "variants": ["the ninefold fruit of the spirit from galatians 5:22-23", "love joy peace patience kindness goodness faithfulness gentleness self-control", "galatians 5 — nine qualities produced by the spirit's work in the believer"],
        "vocab": [{"term": "fruit of the Spirit", "definition": "The nine qualities listed in Galatians 5:22-23 produced by the Holy Spirit in the believer; described as singular fruit — a unified character rather than nine separate achievements"}, {"term": "works of the flesh", "definition": "The contrasting list in Galatians 5:19-21 of acts produced by sinful human nature; Paul lists fifteen vices to contrast with the Spirit's fruit, framing the Christian life as a choice between two powers"}]
    },
    "ntf06_lesson_13": {
        "course": "new-testament-foundations-06-pauline-epistles",
        "q": "Review question: What does Paul say believers were before God made them alive in Ephesians 2? Answer: dead in trespasses and sins, following the prince of the power of the air, and by nature children of wrath.",
        "answer": "dead in trespasses and sins, following Satan, and children of wrath by nature",
        "variants": ["dead in sin and following the spirit of disobedience — children of wrath", "ephesians 2 describes the pre-conversion state as spiritual death under satanic influence", "dead in sin, subject to satan, and deserving wrath — before God's grace intervened"],
        "vocab": [{"term": "dead in sin", "definition": "Paul's description in Ephesians 2:1 of human spiritual condition before salvation; not injured or weakened but dead — requiring divine resurrection, not human effort"}, {"term": "body of Christ", "definition": "Paul's image in Ephesians 4 for the church as Christ's body with Christ as head; every member has a role and the whole body grows together in love"}]
    },
    "ntf06_lesson_14": {
        "course": "new-testament-foundations-06-pauline-epistles",
        "q": "Review question: What is the armor of God that Paul describes in Ephesians 6? Answer: the belt of truth, breastplate of righteousness, feet fitted with the gospel of peace, shield of faith, helmet of salvation, and sword of the Spirit which is the word of God.",
        "answer": "belt of truth, breastplate of righteousness, gospel of peace, shield of faith, helmet of salvation, and sword of the Spirit",
        "variants": ["the six pieces of armor in ephesians 6 — truth righteousness gospel faith salvation and the word", "the full armor of god: truth belt, righteousness breastplate, peace shoes, faith shield, salvation helmet, word sword", "ephesians 6:14-17 — the complete armor for standing against spiritual forces"],
        "vocab": [{"term": "armor of God", "definition": "Paul's metaphor in Ephesians 6:10-18 for the spiritual resources available to believers in the cosmic conflict against evil; the imagery draws on Isaiah 59 where God himself wears armor"}, {"term": "principalities and powers", "definition": "Paul's terms in Ephesians 6:12 for the spiritual forces behind human opposition; the Christian's struggle is not merely human but involves cosmic evil requiring divine armor"}]
    },
    "ntf06_lesson_15": {
        "course": "new-testament-foundations-06-pauline-epistles",
        "q": "Review question: What does Paul describe as his one ambition and driving purpose in Philippians 1? Answer: that Christ will be honored in his body whether by life or by death — for to him to live is Christ and to die is gain.",
        "answer": "that Christ be honored in his body whether by life or death — to live is Christ and to die is gain",
        "variants": ["his purpose is christ being magnified in his body — living or dying", "philippians 1 — for me to live is christ to die is gain", "whether he lives or dies paul wants christ exalted in him"],
        "vocab": [{"term": "to live is Christ", "definition": "Paul's autobiographical statement in Philippians 1:21 expressing that his entire existence is defined by and for Christ; dying brings gain because it means being with Christ"}, {"term": "Philippians as prison letter", "definition": "Philippians was written by Paul during imprisonment, likely in Rome; despite his chains he writes a letter overflowing with joy — demonstrating that circumstances do not determine contentment"}]
    },
    "ntf06_lesson_16": {
        "course": "new-testament-foundations-06-pauline-epistles",
        "q": "Review question: What does Paul say about his attitude toward circumstances in Philippians 4:11? Answer: he has learned, in whatever state he is, to be content — whether abased or abounding.",
        "answer": "he has learned contentment in all circumstances — whether abased or abounding",
        "variants": ["I have learned to be content in all situations", "philippians 4 — contentment in abundance and in need has been learned not given", "paul says he knows how to be brought low and how to abound — contentment is learned"],
        "vocab": [{"term": "Christ-hymn", "definition": "The poem in Philippians 2:6-11 describing Christ's humiliation (emptying himself, taking servant form) and exaltation (name above all names); it grounds the call to humble others-focused living"}, {"term": "I can do all things through Christ", "definition": "Philippians 4:13 in context — not a general promise of ability but Paul's testimony that Christ strengthens him to face both abundance and need with contentment"}]
    },
    "ntf06_lesson_17": {
        "course": "new-testament-foundations-06-pauline-epistles",
        "q": "Review question: What is the Christ-hymn in Colossians 1:15-20 about? Answer: it describes Christ as the image of the invisible God, firstborn over all creation, through whom all things were created and in whom all things hold together.",
        "answer": "Christ is the image of God, firstborn over creation, creator and sustainer of all things",
        "variants": ["colossians 1 — christ is the image of god and the agent of creation and redemption", "he is before all things and in him all things hold together — the pre-eminent one", "the colossian hymn: christ as creator, sustainer, and head of the church"],
        "vocab": [{"term": "image of the invisible God", "definition": "Paul's description of Christ in Colossians 1:15 — not a copy but the exact representation; to see Christ is to see what God is like"}, {"term": "head of the body", "definition": "Paul's image in Colossians 1:18 for Christ's relationship to the church; Christ is the source of life and direction for the body — the church as organism depends on him for everything"}]
    },
    "ntf06_lesson_18": {
        "course": "new-testament-foundations-06-pauline-epistles",
        "q": "Review question: What does Paul tell the Colossians to put on in Colossians 3? Answer: compassion, kindness, humility, meekness, and patience, bearing with one another and forgiving each other. Over all these put on love.",
        "answer": "compassion, kindness, humility, meekness, patience, bearing with one another, forgiving, and love above all",
        "variants": ["put on the new self: compassion kindness humility meekness patience — and over all love", "colossians 3 — the new self is clothed in christ-like virtues with love as the outermost garment", "bearing with and forgiving one another and binding all together in love"],
        "vocab": [{"term": "household code", "definition": "The instructions in Colossians 3:18-4:1 for wives, husbands, children, fathers, slaves, and masters; Paul structures relationships within the existing social order while reframing them around Christ"}, {"term": "fullness of God in Christ", "definition": "The teaching in Colossians 2:9-10 that all the fullness of deity dwells bodily in Christ and believers are complete in him; it refutes any claim that supplementary wisdom or practices are needed"}]
    },
    "ntf06_lesson_19": {
        "course": "new-testament-foundations-06-pauline-epistles",
        "q": "Review question: What did Paul commend the Thessalonians for in 1 Thessalonians 1? Answer: their work of faith, labor of love, and steadfastness of hope in the Lord Jesus Christ — and their example that spread throughout Macedonia and Achaia.",
        "answer": "work of faith, labor of love, steadfastness of hope — and their example spread to all Macedonia and Achaia",
        "variants": ["the three virtues — faith hope love expressed in work labor and steadfastness", "their faith became known throughout the region without paul needing to say anything", "1 thessalonians 1 — work of faith labor of love hope of the lord, and a widespread testimony"],
        "vocab": [{"term": "election", "definition": "Paul's affirmation in 1 Thessalonians 1:4 that the Thessalonians are beloved and chosen by God; the gospel came to them in power and the Spirit confirming their election"}, {"term": "turned from idols", "definition": "The summary of Thessalonian conversion in 1 Thessalonians 1:9 — they turned from idols to serve the living and true God and to wait for his Son from heaven; three elements of their conversion"}]
    },
    "ntf06_lesson_20": {
        "course": "new-testament-foundations-06-pauline-epistles",
        "q": "Review question: What does Paul say will happen to believers who have died when the Lord returns in 1 Thessalonians 4? Answer: they will rise first, then those who are alive will be caught up together with them to meet the Lord in the air.",
        "answer": "the dead in Christ rise first, then the living are caught up with them to meet the Lord",
        "variants": ["dead in christ rise first — then the living are caught up together in the air", "1 thessalonians 4 — resurrection then rapture together to be with the lord", "those who died are not at a disadvantage — they rise first at the lord's return"],
        "vocab": [{"term": "parousia", "definition": "Greek for arrival or presence; Paul uses it in 1 Thessalonians 4-5 for the Second Coming of Christ; the term was also used for the arrival of a king visiting a city"}, {"term": "day of the Lord", "definition": "An OT and NT term for the day of God's decisive intervention in judgment and salvation; Paul tells the Thessalonians in chapter 5 it comes like a thief in the night — sudden and unexpected"}]
    },
    "ntf06_lesson_21": {
        "course": "new-testament-foundations-06-pauline-epistles",
        "q": "Review question: What does Paul say about the man of lawlessness in 2 Thessalonians 2? Answer: he will exalt himself above every god and object of worship, proclaiming himself to be God, before the Lord Jesus destroys him at his coming.",
        "answer": "he exalts himself above God and claims to be God — destroyed by the breath of Christ's mouth at his coming",
        "variants": ["the man of lawlessness claims to be god and is destroyed by christ's return", "2 thessalonians 2 — the antichrist figure defeated by the lord at his appearance", "he sets himself up as god in the temple before the lord's coming destroys him"],
        "vocab": [{"term": "man of lawlessness", "definition": "The figure in 2 Thessalonians 2 who opposes and exalts himself against every god; he deceives many before being destroyed by Christ's coming — often identified with the antichrist of 1 John"}, {"term": "restrainer", "definition": "The unnamed power in 2 Thessalonians 2:6-7 that currently prevents the man of lawlessness from being revealed; its identity is debated — interpretations include the Roman Empire, the Holy Spirit, or Michael"}]
    },
    "ntf06_lesson_22": {
        "course": "new-testament-foundations-06-pauline-epistles",
        "q": "Review question: What does Paul say is the pillar and foundation of truth in 1 Timothy 3:15? Answer: the church of the living God.",
        "answer": "the church of the living God",
        "variants": ["the household of god is the pillar and foundation of truth", "1 timothy 3:15 — the church as the support and ground of the truth", "the assembly of the living god upholds and guards the truth"],
        "vocab": [{"term": "overseer", "definition": "The Greek episkopos in 1 Timothy 3:1-7 translated bishop or elder; the qualifications Paul gives are character-based rather than skill-based, centered on being above reproach"}, {"term": "godliness with contentment", "definition": "Paul's description of great gain in 1 Timothy 6:6; the antidote to the love of money is not poverty but a combination of piety and satisfaction with what God provides"}]
    },
    "ntf06_lesson_23": {
        "course": "new-testament-foundations-06-pauline-epistles",
        "q": "Review question: What does Paul say Timothy should flee and what should he pursue in 1 Timothy 6? Answer: flee the love of money and the desires it brings; pursue righteousness, godliness, faith, love, steadfastness, and gentleness.",
        "answer": "flee love of money; pursue righteousness, godliness, faith, love, steadfastness, and gentleness",
        "variants": ["run from greed and pursue righteousness godliness faith love patience meekness", "1 timothy 6 — the man of god flees worldly desires and chases godly virtues", "timothy is told to flee covetousness and follow after six spiritual qualities"],
        "vocab": [{"term": "love of money", "definition": "What Paul calls a root of all kinds of evil in 1 Timothy 6:10; he is not condemning wealth itself but the greed that treats money as the source of life and security rather than God"}, {"term": "deposit", "definition": "The Greek paratheke meaning something entrusted for safekeeping; Paul uses it in 1 Timothy 6:20 and 2 Timothy 1:14 for the gospel truth entrusted to Timothy to guard and pass on"}]
    },
    "ntf06_lesson_24": {
        "course": "new-testament-foundations-06-pauline-epistles",
        "q": "Review question: What does Paul say God gave believers in 2 Timothy 1:7 instead of a spirit of fear? Answer: a spirit of power, love, and self-discipline.",
        "answer": "a spirit of power, love, and self-discipline",
        "variants": ["power love and a sound mind — not a spirit of timidity", "god's spirit brings power and love and self-control not fear", "2 timothy 1:7 — the spirit given is one of power love and sound judgment"],
        "vocab": [{"term": "fan into flame", "definition": "Paul's command in 2 Timothy 1:6 to stir up the gift of God in Timothy; the image is of rekindling smoldering embers — a call to active, courageous use of spiritual gifting"}, {"term": "soldier, athlete, farmer", "definition": "Three analogies in 2 Timothy 2:3-7 for the Christian life — each requires focused endurance and willingness to suffer; Paul uses them to encourage Timothy to persevere under hardship"}]
    },
    "ntf06_lesson_25": {
        "course": "new-testament-foundations-06-pauline-epistles",
        "q": "Review question: What does Paul say all Scripture is in 2 Timothy 3:16-17? Answer: God-breathed and useful for teaching, rebuking, correcting, and training in righteousness, so that the servant of God may be thoroughly equipped for every good work.",
        "answer": "God-breathed and useful for teaching, rebuking, correcting, and training in righteousness",
        "variants": ["all scripture is inspired by god — useful for doctrine reproof correction and training", "2 timothy 3:16 — theopneustos — god-breathed scripture equips for all good works", "given by god's breath — profitable for four purposes so god's servant is complete"],
        "vocab": [{"term": "theopneustos", "definition": "The Greek word in 2 Timothy 3:16 translated God-breathed or inspired; it means Scripture is the product of God's breath — originating in him rather than merely human thought"}, {"term": "preach the word", "definition": "Paul's final charge to Timothy in 2 Timothy 4:2 — preach in season and out of season; it captures the urgency and the call to persistence that runs through all the Pastoral Epistles"}]
    },
    "ntf06_lesson_26": {
        "course": "new-testament-foundations-06-pauline-epistles",
        "q": "Review question: What does Paul say in Titus 2:11 about the grace of God? Answer: the grace of God has appeared, bringing salvation for all people.",
        "answer": "the grace of God has appeared, bringing salvation for all people",
        "variants": ["god's saving grace appeared for all humanity", "titus 2:11 — grace has appeared and it is for all people", "the epiphany of saving grace for all — titus 2"],
        "vocab": [{"term": "good works in Titus", "definition": "The recurring emphasis in Titus (1:16; 2:7,14; 3:1,8,14) on visible godly behavior; Titus connects sound doctrine to practical conduct — believers are to be zealous for good works"}, {"term": "epiphany", "definition": "Greek for appearing or manifestation; used in Titus 2:11 and 2:13 for both Christ's first coming (grace appeared) and second coming (the blessed hope) — structuring the Christian life between two appearances"}]
    },
    "ntf06_lesson_27": {
        "course": "new-testament-foundations-06-pauline-epistles",
        "q": "Review question: What does Paul ask Philemon to do for Onesimus in the letter to Philemon? Answer: to receive Onesimus back no longer as a slave but as a dear brother in the Lord — and to charge any debt he owes to Paul.",
        "answer": "receive Onesimus as a dear brother, no longer just as a slave — and charge his debt to Paul",
        "variants": ["paul asks philemon to welcome onesimus as a brother and credit any debt to paul", "receive him as you would me — and charge anything he owes to my account", "philemon is asked to see onesimus through the lens of the gospel as a beloved brother"],
        "vocab": [{"term": "Onesimus", "definition": "The slave whose return to Philemon is the subject of Paul's letter; his name means useful in Greek — Paul puns on this: formerly useless but now useful, as a brother in Christ"}, {"term": "gospel and social structures", "definition": "Philemon's central question: does the gospel change how we relate across social divides? Paul does not abolish slavery institutionally but reframes the Philemon-Onesimus relationship around brotherhood in Christ"}]
    },
    # ── GENERAL EPISTLES ───────────────────────────────────────────────────
    "ntf07_lesson_01": {
        "course": "new-testament-foundations-07-general-epistles-revelation",
        "q": "Review question: What does Hebrews 1:1-2 say about how God has spoken in these last days? Answer: in these last days he has spoken to us by his Son, whom he appointed heir of all things and through whom he made the universe.",
        "answer": "in these last days God spoke through his Son — heir of all things, through whom he made the universe",
        "variants": ["god spoke in the prophets but in these last days by his son who is heir and creator", "hebrews 1 — the son is God's final and superior word surpassing the prophets", "the son is the last word — appointed heir and agent of creation"],
        "vocab": [{"term": "better", "definition": "The key word in Hebrews appearing thirteen times; Christ is better than angels, Moses, Aaron, and the old covenant — establishing the complete superiority of the new covenant"}, {"term": "Melchizedek", "definition": "The mysterious priest-king of Genesis 14 whose order of priesthood Hebrews applies to Christ in chapters 5-7; unlike Aaronic priests, Jesus holds a permanent priesthood after Melchizedek's order"}]
    },
    "ntf07_lesson_02": {
        "course": "new-testament-foundations-07-general-epistles-revelation",
        "q": "Review question: What does Hebrews 9:22 say about forgiveness? Answer: without the shedding of blood there is no forgiveness of sins.",
        "answer": "without the shedding of blood there is no forgiveness of sins",
        "variants": ["hebrews 9:22 — no remission without blood", "blood must be shed for forgiveness — there is no other way", "the atonement principle: forgiveness requires blood"],
        "vocab": [{"term": "once for all", "definition": "The phrase in Hebrews 7:27, 9:12, and 10:10 describing Christ's sacrifice; unlike the repeated OT sacrifices, Christ's death was a single definitive act that permanently secured atonement"}, {"term": "new covenant", "definition": "Hebrews 8-9 develops Jeremiah 31:31-34 as the better covenant Christ mediates; laws written on the heart, God as their God, and sins remembered no more — established by Christ's blood"}]
    },
    "ntf07_lesson_03": {
        "course": "new-testament-foundations-07-general-epistles-revelation",
        "q": "Review question: How does Hebrews 11 define faith? Answer: faith is the assurance of things hoped for, the conviction of things not seen.",
        "answer": "faith is the assurance of things hoped for, the conviction of things not seen",
        "variants": ["hebrews 11:1 — the substance of hoped-for things and evidence of unseen realities", "faith is being sure of what we hope for and certain of what we do not see", "the definition of faith — confident trust in unseen realities"],
        "vocab": [{"term": "hall of faith", "definition": "The survey of OT believers in Hebrews 11 who acted on faith before receiving what was promised; they lived as strangers looking for a heavenly city — commended despite not receiving the promise in their lifetime"}, {"term": "cloud of witnesses", "definition": "The image in Hebrews 12:1 of the OT saints whose example surrounds believers as they run the race; their lives of faith are the testimony (witness) that emboldens those who follow"}]
    },
    "ntf07_lesson_04": {
        "course": "new-testament-foundations-07-general-epistles-revelation",
        "q": "Review question: What does James say faith without works is? Answer: dead.",
        "answer": "dead",
        "variants": ["faith without works is dead", "james 2 — faith alone without deeds is dead faith", "faith that produces no works is useless and dead"],
        "vocab": [{"term": "faith and works in James", "definition": "James 2:14-26's argument that genuine faith produces visible works; James does not contradict Paul but addresses different problems — Paul combats earning salvation by works, James combats claiming faith without evidence"}, {"term": "taming the tongue", "definition": "James 3's extended metaphor comparing the tongue to a ship's rudder and a spark; the tongue's power to bless and curse from the same mouth reveals the need for wisdom from above"}]
    },
    "ntf07_lesson_05": {
        "course": "new-testament-foundations-07-general-epistles-revelation",
        "q": "Review question: What does James 4:6 say God gives to the humble? Answer: grace — God opposes the proud but gives grace to the humble.",
        "answer": "grace — God opposes the proud but gives grace to the humble",
        "variants": ["god resists the proud and gives grace to the humble — james 4:6", "the humble receive grace while pride draws God's opposition", "james 4 — humility opens the door to grace and divine favor"],
        "vocab": [{"term": "wisdom from above", "definition": "James 3:17's description of true wisdom as pure, peace-loving, gentle, compliant, full of mercy, and without favoritism; contrasted with earthly, unspiritual, demonic wisdom that produces disorder"}, {"term": "prayer of faith", "definition": "The prayer described in James 5:14-16 for healing by the elders, anointing with oil; James grounds it in the example of Elijah and ties it to confession of sin"}]
    },
    "ntf07_lesson_06": {
        "course": "new-testament-foundations-07-general-epistles-revelation",
        "q": "Review question: What does Peter call believers in 1 Peter 2:9? Answer: a chosen race, a royal priesthood, a holy nation, a people for God's own possession.",
        "answer": "a chosen race, a royal priesthood, a holy nation, a people for God's own possession",
        "variants": ["chosen race royal priesthood holy nation God's own people — 1 peter 2:9", "the four OT descriptions applied to the church: chosen, royal priests, holy nation, God's possession", "believers are what Israel was called to be — a kingdom of priests and a holy people"],
        "vocab": [{"term": "living hope", "definition": "Peter's description of salvation in 1 Peter 1:3 — new birth into a living hope through Christ's resurrection; the hope is alive because it is grounded in the risen Christ"}, {"term": "elect exiles", "definition": "Peter's address to his audience in 1 Peter 1:1 — dispersed believers who are chosen by God yet strangers in the world; the tension of election and exile shapes the entire letter"}]
    },
    "ntf07_lesson_07": {
        "course": "new-testament-foundations-07-general-epistles-revelation",
        "q": "Review question: What does Peter say Christ's suffering left for believers in 1 Peter 2:21? Answer: an example, so that they should follow in his steps.",
        "answer": "an example for believers to follow in his steps",
        "variants": ["christ left an example of suffering for us to imitate", "1 peter 2:21 — his suffering was an example to follow", "he suffered leaving us a pattern to walk in his footsteps"],
        "vocab": [{"term": "suffering servant in Peter", "definition": "Peter applies Isaiah 53 to Christ's suffering in 1 Peter 2:22-25; Christ bore sins in his body on the tree and his wounds bring healing — the foundation for enduring unjust suffering"}, {"term": "1 Peter 3:15", "definition": "The command to always be prepared to give a reason for the hope that is in you; it grounds apologetics (defense of the faith) in a posture of gentleness and respect"}]
    },
    "ntf07_lesson_08": {
        "course": "new-testament-foundations-07-general-epistles-revelation",
        "q": "Review question: What does Peter say false teachers will secretly introduce in 2 Peter 2? Answer: destructive heresies, even denying the sovereign Lord who bought them.",
        "answer": "destructive heresies, denying the Lord who bought them",
        "variants": ["they secretly bring in damnable heresies and deny the lord", "2 peter 2 — false teachers introduce heresies and deny the master who redeemed them", "destructive doctrines and denial of Christ characterize the false teachers"],
        "vocab": [{"term": "divine power has given us all things", "definition": "Peter's opening in 2 Peter 1:3 — all things pertaining to life and godliness have been given through knowing Christ; the basis for adding the eight qualities Peter lists in 1:5-7"}, {"term": "prophetic word", "definition": "Peter's description of Scripture in 2 Peter 1:19-21 as more certain than his own eyewitness experience; no prophecy came from human will but holy men spoke as carried by the Holy Spirit"}]
    },
    "ntf07_lesson_09": {
        "course": "new-testament-foundations-07-general-epistles-revelation",
        "q": "Review question: What does Peter say in 2 Peter 3:9 about why the Lord has not yet returned? Answer: he is patient, not wanting anyone to perish, but everyone to come to repentance.",
        "answer": "God is patient, not wanting anyone to perish but all to come to repentance",
        "variants": ["the lord is not slow but patient — wanting all to reach repentance", "2 peter 3:9 — delay is divine patience not failure", "god delays to allow all to repent — his apparent slowness is mercy"],
        "vocab": [{"term": "day of the Lord in 2 Peter", "definition": "The coming day in 2 Peter 3 when the heavens will pass away with a roar and the elements dissolve; Peter uses it to motivate holy living in light of the coming new creation"}, {"term": "new heavens and new earth", "definition": "Peter's description in 2 Peter 3:13 of what God promises — a new creation in which righteousness dwells; it echoes Isaiah 65-66 and anticipates Revelation 21-22"}]
    },
    "ntf07_lesson_10": {
        "course": "new-testament-foundations-07-general-epistles-revelation",
        "q": "Review question: What does Jude say believers are to do regarding the faith in verse 3? Answer: contend earnestly for the faith that was once for all delivered to the saints.",
        "answer": "contend earnestly for the faith once for all delivered to the saints",
        "variants": ["fight for the faith that was given once to god's people", "jude 3 — the charge to defend the faith delivered once and for all to the saints", "earnestly contend for the faith — jude urges vigorous defense of the gospel"],
        "vocab": [{"term": "once for all delivered", "definition": "Jude 3's description of the faith as a fixed deposit entrusted to the saints; the faith is not evolving or open to revision — it was given once and is to be guarded"}, {"term": "apostasy", "definition": "The falling away from true faith condemned in Jude; those who crept into the community deny Christ while using grace as an excuse for immorality — Jude draws on Sodom, the angels, and Cain as warnings"}]
    },
    "ntf07_lesson_11": {
        "course": "new-testament-foundations-07-general-epistles-revelation",
        "q": "Review question: What does John say is the test of whether we know God in 1 John 2:3? Answer: we keep his commandments.",
        "answer": "we keep his commandments",
        "variants": ["keeping god's commandments is the evidence of knowing him", "1 john 2:3 — obedience to his commands proves we know him", "knowing god is demonstrated by keeping what he commands"],
        "vocab": [{"term": "walking in the light", "definition": "John's ethical image in 1 John 1:7 for genuine Christian life — living openly in conformity with God's character; contrasted with walking in darkness, which describes self-deception about sin"}, {"term": "propitiation", "definition": "The Greek hilasmos in 1 John 2:2 translated propitiation or atoning sacrifice; it refers to Christ satisfying God's wrath against sin — a substitutionary turning away of divine judgment"}]
    },
    "ntf07_lesson_12": {
        "course": "new-testament-foundations-07-general-epistles-revelation",
        "q": "Review question: What does John say we know about God's character in 1 John 4:8? Answer: God is love.",
        "answer": "God is love",
        "variants": ["1 john 4:8 — God is love", "john declares that love is not just what god does but what he is", "the nature of god is love — not merely that he loves"],
        "vocab": [{"term": "God is love", "definition": "John's declaration in 1 John 4:8,16 — not merely that God loves but that love is essential to his being; the ground of all Christian ethics and the source of the believer's capacity to love"}, {"term": "spirits in 1 John", "definition": "John's warning in 1 John 4:1-6 to test the spirits because false prophets have gone out; the test is whether a spirit confesses that Jesus Christ came in the flesh"}]
    },
    "ntf07_lesson_13": {
        "course": "new-testament-foundations-07-general-epistles-revelation",
        "q": "Review question: What warning does 2 John give about receiving teachers into your house? Answer: do not receive into your house or give greeting to anyone who does not bring the teaching of Christ, because you share in his evil works.",
        "answer": "do not receive or greet those who do not bring the teaching of Christ — you share in their evil works",
        "variants": ["do not welcome teachers who deny the doctrine of christ", "2 john — hospitality must not extend to those bringing false teaching about christ", "greeting false teachers makes you share in their wrong"],
        "vocab": [{"term": "the chosen lady", "definition": "The address of 2 John to the elect lady and her children; most scholars understand this as a local church and its members rather than a literal woman"}, {"term": "Diotrephes", "definition": "The church leader in 3 John who rejected John's authority and refused to welcome traveling missionaries; a warning example of pride and power-seeking in church leadership"}]
    },
    "ntf07_lesson_14": {
        "course": "new-testament-foundations-07-general-epistles-revelation",
        "q": "Review question: What does Jesus say in Revelation 1:8 about himself? Answer: I am the Alpha and the Omega, says the Lord God, who is and who was and who is to come, the Almighty.",
        "answer": "I am the Alpha and the Omega — who is, who was, and who is to come, the Almighty",
        "variants": ["the alpha and omega who is was and is to come — the almighty", "revelation 1:8 — Christ is the first and last and the eternal self-sufficient one", "the Lord identifies himself as alpha omega almighty and the eternal one"],
        "vocab": [{"term": "Apocalypse", "definition": "Greek for unveiling or revelation; Revelation opens with apokalypsis — this book unveils what is otherwise hidden about Christ's identity and the outcome of history"}, {"term": "seven churches", "definition": "The seven churches in Revelation 1-3 located in Asia Minor (modern Turkey): Ephesus, Smyrna, Pergamum, Thyatira, Sardis, Philadelphia, and Laodicea — each letter addressed their specific strengths and failures"}]
    },
    "ntf07_lesson_15": {
        "course": "new-testament-foundations-07-general-epistles-revelation",
        "q": "Review question: Who alone was found worthy to open the scroll in Revelation 5? Answer: the Lion of Judah, the Root of David — who John then sees as the Lamb who was slain.",
        "answer": "the Lion of Judah and Root of David — seen as the Lamb who was slain",
        "variants": ["only the lamb who was slain — the lion who is the lamb — was worthy", "revelation 5 — the slain lamb alone could open the scroll", "the lion of judah appeared as a slain lamb — worthy to open the sealed scroll"],
        "vocab": [{"term": "the Lamb", "definition": "John's primary title for Christ in Revelation, appearing twenty-eight times; the image combines the sacrificial Passover lamb with the shepherd-king — power through sacrifice"}, {"term": "four living creatures", "definition": "The heavenly beings around God's throne in Revelation 4 described as lion, ox, human, and eagle; they lead worship and echo the cherubim of Ezekiel — representing the fullness of creation before God"}]
    },
    "ntf07_lesson_16": {
        "course": "new-testament-foundations-07-general-epistles-revelation",
        "q": "Review question: What are the 144,000 in Revelation 7 described as, and what are they sealed for? Answer: servants of God sealed on their foreheads for God's protection through the coming tribulation.",
        "answer": "servants of God sealed on their foreheads for protection through the coming tribulation",
        "variants": ["god's servants sealed for his protection — from every tribe of israel", "the 144,000 are marked on their foreheads as belonging to God before judgment falls", "sealed servants of God — twelve thousand from each tribe, protected in tribulation"],
        "vocab": [{"term": "144,000", "definition": "The number sealed in Revelation 7 drawn from twelve tribes times twelve thousand; most interpreters understand it symbolically as the complete people of God — perfection and completeness in numerical form"}, {"term": "great tribulation", "definition": "The period of intense trial described in Revelation 7:14 through which the martyrs have come; they stand before the throne in white robes having washed them in the Lamb's blood"}]
    },
    "ntf07_lesson_17": {
        "course": "new-testament-foundations-07-general-epistles-revelation",
        "q": "Review question: What is Babylon in Revelation 17-18, and what is she called? Answer: the great prostitute who sits on many waters, drunk with the blood of saints — called Babylon the Great, mother of prostitutes.",
        "answer": "the great prostitute drunk with the blood of saints — Babylon the Great, mother of prostitutes",
        "variants": ["babylon the great — a harlot symbolizing the seductive power of worldly empire against God's people", "revelation 17 — the woman on the scarlet beast is babylon representing corrupt worldly power", "mother of prostitutes — Babylon as the system opposing God who persecutes the saints"],
        "vocab": [{"term": "Babylon", "definition": "John's symbolic name in Revelation 17-18 for Rome and all corrupt worldly power that seduces people away from God and persecutes believers; the name evokes the OT exile"}, {"term": "merchants of the earth", "definition": "Those who grew rich trading with Babylon in Revelation 18; their lament at Babylon's fall reveals the economic power that drives allegiance to corrupt empires"}]
    },
    "ntf07_lesson_18": {
        "course": "new-testament-foundations-07-general-epistles-revelation",
        "q": "Review question: What does Revelation 20:12 say the dead are judged by? Answer: what was written in the books, according to their works.",
        "answer": "what was written in the books, according to their works",
        "variants": ["the books were opened and the dead judged by their works", "revelation 20 — judgment according to what is written and what was done", "the record in the books and the book of life determine the final verdict"],
        "vocab": [{"term": "great white throne", "definition": "The throne of final judgment in Revelation 20:11-15; the dead are raised and judged according to their works, and anyone not found in the book of life is cast into the lake of fire"}, {"term": "book of life", "definition": "The record of those belonging to God in Revelation 20:12,15; those not found in it face the second death — its appearance throughout Revelation (3:5; 13:8; 17:8; 20:12,15) frames salvation as God's sovereign keeping"}]
    },
    "ntf07_lesson_19": {
        "course": "new-testament-foundations-07-general-epistles-revelation",
        "q": "Review question: What does God declare in Revelation 21:5 that he is doing? Answer: Behold, I am making all things new.",
        "answer": "Behold, I am making all things new",
        "variants": ["I make all things new — god's declaration in revelation 21", "god sitting on the throne says behold I make all things new", "the final declaration — new creation through renewal of all things"],
        "vocab": [{"term": "new Jerusalem", "definition": "The city descending from heaven in Revelation 21 as the dwelling of God with his people; its dimensions as a cube echo the Most Holy Place and its gates of pearl and streets of gold describe the perfection of God's presence"}, {"term": "no more death", "definition": "The promise in Revelation 21:4 that in the new creation death, mourning, crying, and pain are no more; it is the reversal of the fall's curse and the fulfillment of Isaiah 25:8"}]
    }
}

def fix_lesson(lesson_id, lesson_data_input, filepath):
    fix = LESSONS.get(lesson_id)
    if not fix:
        return False

    segment_type_to_seq = {
        "orientation": 1, "reading": 2, "context": 3,
        "analysis": 4, "themes": 5, "question": 6, "close": 7
    }

    new_segments = []
    for seg in lesson_data_input.get("segments", []):
        new_seg = {}
        seg_type = seg.get("type", "")
        new_seg["type"] = seg_type
        new_seg["sequence"] = segment_type_to_seq.get(seg_type, 0)

        if seg_type == "question":
            new_seg["audio_script"] = fix["q"]
            new_seg["correct_answer"] = fix["answer"]
            new_seg["acceptable_variants"] = fix["variants"]
            new_seg["word_count"] = len(fix["q"].split())
        else:
            new_seg["audio_script"] = seg.get("audio_script", "")
            new_seg["word_count"] = len(seg.get("audio_script", "").split())

        new_segments.append(new_seg)

    lesson_data_input["segments"] = new_segments
    lesson_data_input["vocabulary"] = fix["vocab"]

    with open(filepath, "w") as f:
        json.dump(lesson_data_input, f, indent=2, ensure_ascii=False)
    return True

processed = 0
errors = 0
for lesson_id, fix in sorted(LESSONS.items()):
    course_folder = fix["course"]
    filepath = os.path.join(BASE, course_folder, "lessons", f"{lesson_id}.json")
    if not os.path.exists(filepath):
        print(f"NOT FOUND: {filepath}")
        errors += 1
        continue
    with open(filepath) as f:
        data = json.load(f)
    if fix_lesson(lesson_id, data, filepath):
        print(f"  Updated {lesson_id}")
        processed += 1
    else:
        print(f"  Skipped {lesson_id}")

print(f"\nDone. {processed} updated, {errors} missing files.")
