/* BM-Trainer – Englisch: Hörverständnis (Listening)
   Eigene Hörtexte, die im Browser per Sprachausgabe (Text-to-Speech) vorgelesen werden.
   Sprecher: N = Erzähler/Durchsage, A und B = zwei verschiedene Stimmen im Dialog. */
(function (root) {
  'use strict';
  const BMP = root.BMP;
  const en = BMP.getSubject('englisch');

  const AUDIO = [
    {
      id: 'station', voices: { N: 'm' }, title: 'Announcement at a train station', kind: 'Durchsage',
      lines: [
        ['N', 'Attention please. This is an announcement for passengers travelling to Manchester.'],
        ['N', 'The ten fifteen train to Manchester will now leave from platform seven, not platform four.'],
        ['N', 'Because of works on the line, the train is running about twenty minutes late. We expect it to leave at ten thirty-five.'],
        ['N', 'Passengers for Liverpool should change at Crewe. Please note that there is no food or drink service on this train today.'],
        ['N', 'We apologise for any inconvenience.']
      ],
      qs: [
        { type: 'number', q: 'From which platform will the train to Manchester leave?', answer: 7, explain: '«… will now leave from platform seven, not platform four.»' },
        { type: 'mc', q: 'Why is the train late?', options: ['bad weather', 'works on the line', 'a problem with the engine', 'too many passengers'], answer: 1, explain: '«Because of works on the line …»' },
        { type: 'mc', q: 'At what time is the train expected to leave?', options: ['10:15', '10:20', '10:35', '10:45'], answer: 2, explain: '«We expect it to leave at ten thirty-five.»' },
        { type: 'text', q: 'Where do passengers for Liverpool have to change trains? (one word)', answer: ['Crewe', 'at Crewe'], explain: '«Passengers for Liverpool should change at Crewe.»' },
        { type: 'mc', q: 'What is NOT available on the train today?', options: ['seats', 'toilets', 'food and drinks', 'Wi-Fi'], answer: 2, explain: '«… there is no food or drink service on this train today.»' }
      ]
    },
    {
      id: 'voicemail', voices: { A: 'f' }, title: 'A voice message from a friend', kind: 'Telefonnachricht',
      lines: [
        ['A', 'Hi Lisa, it’s Emma. I’m calling about Saturday.'],
        ['A', 'The concert starts at eight, but I think we should meet a bit earlier, at seven, in front of the cinema on King Street. Then we can get something to eat first.'],
        ['A', 'Oh, and don’t forget your ticket. I printed mine, but you can also show it on your phone.'],
        ['A', 'My brother can drive us home after the concert, so you don’t need to take the last bus.'],
        ['A', 'Call me back when you get this message. My number is oh seven nine four, double three, five six two. Bye!']
      ],
      qs: [
        { type: 'mc', q: 'What time does the concert start?', options: ['at 7 o’clock', 'at 8 o’clock', 'at 9 o’clock', 'at half past seven'], answer: 1, explain: '«The concert starts at eight …»' },
        { type: 'mc', q: 'Where do the girls meet?', options: ['at the concert hall', 'at the bus station', 'in front of the cinema', 'at Emma’s house'], answer: 2, explain: '«… at seven, in front of the cinema on King Street.»' },
        { type: 'mc', q: 'Why do they meet earlier?', options: ['to buy tickets', 'to get something to eat', 'to catch the bus', 'to meet Emma’s brother'], answer: 1, explain: '«Then we can get something to eat first.»' },
        { type: 'mc', q: 'How will Lisa get home after the concert?', options: ['by bus', 'by taxi', 'Emma’s brother will drive her', 'on foot'], answer: 2, explain: '«My brother can drive us home after the concert …»' },
        { type: 'text', q: 'Write down Emma’s phone number (only digits).', answer: ['079433562'], digits: true, explain: '«oh seven nine four, double three, five six two» = 0794 33562' }
      ]
    },
    {
      id: 'shop', voices: { A: 'f', B: 'm' }, title: 'Buying a jacket', kind: 'Dialog',
      lines: [
        ['B', 'Good afternoon. Can I help you?'],
        ['A', 'Yes, please. I’m looking for a warm jacket for the winter. Do you have this one in blue?'],
        ['B', 'Let me check. We have it in black, green and dark blue. What size are you?'],
        ['A', 'Medium, I think.'],
        ['B', 'Here you are. The changing rooms are over there, on the left.'],
        ['A', 'Thanks. … It fits really well. How much is it?'],
        ['B', 'It’s eighty pounds, but this week everything in the winter collection is twenty-five percent off. So it’s only sixty pounds.'],
        ['A', 'Great, I’ll take it. Can I pay by card?'],
        ['B', 'Of course. And if there’s a problem, you can bring it back within thirty days. Just keep the receipt.']
      ],
      qs: [
        { type: 'mc', q: 'What colour does the customer buy?', options: ['black', 'green', 'dark blue', 'light blue'], answer: 2, explain: 'She asks for blue – the shop has it in dark blue.' },
        { type: 'mc', q: 'What size does the customer take?', options: ['small', 'medium', 'large', 'extra large'], answer: 1, explain: '«Medium, I think.» – «It fits really well.»' },
        { type: 'number', unit: '£', q: 'How much does the customer pay for the jacket (in pounds)?', answer: 60, explain: '80 pounds minus 25 percent = 60 pounds.' },
        { type: 'mc', q: 'How does the customer pay?', options: ['in cash', 'by card', 'by phone', 'with a voucher'], answer: 1, explain: '«Can I pay by card?» – «Of course.»' },
        { type: 'number', q: 'Within how many days can you bring the jacket back?', answer: 30, explain: '«… you can bring it back within thirty days. Just keep the receipt.»' }
      ]
    },
    {
      id: 'apprentice', voices: { A: 'f', B: 'm' }, title: 'Interview with an apprentice', kind: 'Interview',
      lines: [
        ['A', 'Today on our school radio we’re talking to Noah. Noah, you’re doing an apprenticeship. Can you tell us about it?'],
        ['B', 'Sure. I’m in my second year as a commercial apprentice at an insurance company. I work there three days a week, and on the other two days I go to vocational school.'],
        ['A', 'What do you do at work?'],
        ['B', 'At the moment I’m in the customer service department. I answer emails and phone calls, and I help customers who have questions about their contracts. Next year I’ll move to the accounting department.'],
        ['A', 'What do you like most about your job?'],
        ['B', 'I really like working with people. And I like that I earn my own money. But the days are long – I have to get up at six.'],
        ['A', 'And what are your plans for the future?'],
        ['B', 'I’m doing the vocational baccalaureate at the same time. After that, I’d like to study business administration at a university of applied sciences.']
      ],
      qs: [
        { type: 'mc', q: 'Where does Noah do his apprenticeship?', options: ['at a bank', 'at an insurance company', 'at a school', 'at a travel agency'], answer: 1, explain: '«… a commercial apprentice at an insurance company.»' },
        { type: 'number', q: 'How many days a week does Noah go to vocational school?', answer: 2, explain: 'Three days at work, «on the other two days I go to vocational school».' },
        { type: 'mc', q: 'Which department does Noah work in now?', options: ['accounting', 'marketing', 'customer service', 'IT'], answer: 2, explain: '«At the moment I’m in the customer service department.» Accounting comes next year.' },
        { type: 'mc', q: 'What does Noah NOT like so much?', options: ['working with people', 'earning money', 'getting up early', 'answering emails'], answer: 2, explain: '«But the days are long – I have to get up at six.»' },
        { type: 'mc', q: 'What does Noah want to do after his apprenticeship?', options: ['travel around the world', 'study business administration', 'become a teacher', 'work in another country'], answer: 1, explain: '«… I’d like to study business administration at a university of applied sciences.»' }
      ]
    },
    {
      id: 'weather', voices: { N: 'f' }, title: 'Weather forecast', kind: 'Radio',
      lines: [
        ['N', 'And now the weather for the weekend.'],
        ['N', 'Saturday will start cloudy and cool, with temperatures around eight degrees in the morning. In the afternoon the sun will come out and it will get warmer, up to fifteen degrees.'],
        ['N', 'On Sunday, a strong wind from the west will bring rain to most parts of the country. In the mountains, the rain will turn to snow above one thousand five hundred metres.'],
        ['N', 'So if you’re planning a walk or a bike ride, Saturday afternoon is the best time to go out. On Sunday, don’t forget your umbrella!']
      ],
      qs: [
        { type: 'mc', q: 'What will the weather be like on Saturday morning?', options: ['sunny and warm', 'cloudy and cool', 'rainy and windy', 'snowy'], answer: 1, explain: '«Saturday will start cloudy and cool …»' },
        { type: 'number', unit: '°C', q: 'What is the highest temperature on Saturday afternoon?', answer: 15, explain: '«… it will get warmer, up to fifteen degrees.»' },
        { type: 'mc', q: 'Where will the wind come from on Sunday?', options: ['from the north', 'from the south', 'from the east', 'from the west'], answer: 3, explain: '«… a strong wind from the west …»' },
        { type: 'number', unit: 'm', q: 'Above how many metres will it snow?', answer: 1500, explain: '«… above one thousand five hundred metres.»' },
        { type: 'mc', q: 'When is the best time for a bike ride?', options: ['Saturday morning', 'Saturday afternoon', 'Sunday morning', 'Sunday afternoon'], answer: 1, explain: '«… Saturday afternoon is the best time to go out.»' }
      ]
    },
    {
      id: 'trip', voices: { A: 'm' }, title: 'Information about a school trip', kind: 'Mitteilung',
      lines: [
        ['A', 'Okay everyone, listen, please. I have some information about our class trip to Edinburgh.'],
        ['A', 'We’re leaving on Monday, the fourteenth of May, and we’re coming back on Friday evening. We’ll meet at the airport at six fifteen in the morning – please don’t be late, our flight leaves at eight.'],
        ['A', 'We’ll stay at a youth hostel in the old town. You’ll share rooms with three other students.'],
        ['A', 'The trip costs four hundred and fifty francs. That includes the flight, the hostel and breakfast. Lunch and dinner you pay yourselves, so bring some pocket money.'],
        ['A', 'And very important: you need a valid passport or identity card. Please bring the signed form from your parents by next Wednesday.']
      ],
      qs: [
        { type: 'mc', q: 'On which day does the class leave?', options: ['on Sunday', 'on Monday', 'on Wednesday', 'on Friday'], answer: 1, explain: '«We’re leaving on Monday, the fourteenth of May …»' },
        { type: 'mc', q: 'At what time do they meet at the airport?', options: ['6:15', '6:50', '8:00', '8:15'], answer: 0, explain: '«We’ll meet at the airport at six fifteen …» – the flight leaves at eight.' },
        { type: 'number', q: 'How many students share a room?', answer: 4, explain: '«You’ll share rooms with three other students.» → 4 students per room.' },
        { type: 'number', unit: 'CHF', q: 'How much does the trip cost (in francs)?', answer: 450, explain: '«The trip costs four hundred and fifty francs.»' },
        { type: 'mc', q: 'What is NOT included in the price?', options: ['the flight', 'the hostel', 'breakfast', 'dinner'], answer: 3, explain: '«Lunch and dinner you pay yourselves …»' }
      ]
    },
    {
      id: 'tourist', voices: { A: 'm', B: 'f' }, title: 'At the tourist information', kind: 'Dialog',
      lines: [
        ['A', 'Hello. We’re only in town for one day. What can we do here?'],
        ['B', 'Well, the castle is the most popular sight. It opens at nine thirty, and a ticket for students is twelve pounds.'],
        ['A', 'That sounds good. Is it far from here?'],
        ['B', 'No, it’s about a ten-minute walk. Go straight down this street, then turn left at the church. You can’t miss it.'],
        ['A', 'And is there a good place for lunch?'],
        ['B', 'Try the market hall next to the river. There are lots of small food stands, and it’s not expensive.'],
        ['A', 'Great. One more question: when does the last boat tour leave?'],
        ['B', 'In October, the last tour is at four o’clock. It takes about an hour.'],
        ['A', 'Perfect. Thank you very much!']
      ],
      qs: [
        { type: 'mc', q: 'What does the woman recommend first?', options: ['the museum', 'the castle', 'the market hall', 'the church'], answer: 1, explain: '«… the castle is the most popular sight.»' },
        { type: 'number', unit: '£', q: 'How much is a student ticket for the castle (in pounds)?', answer: 12, explain: '«… a ticket for students is twelve pounds.»' },
        { type: 'mc', q: 'How do you get to the castle?', options: ['Turn right at the river.', 'Take the bus to the church.', 'Go straight on, then turn left at the church.', 'Take a boat.'], answer: 2, explain: '«Go straight down this street, then turn left at the church.»' },
        { type: 'mc', q: 'Where can they have lunch?', options: ['at the castle', 'in a hotel', 'at the market hall next to the river', 'on the boat'], answer: 2, explain: '«Try the market hall next to the river.»' },
        { type: 'mc', q: 'When does the last boat tour leave?', options: ['at 3 o’clock', 'at 4 o’clock', 'at 5 o’clock', 'at 6 o’clock'], answer: 1, explain: '«In October, the last tour is at four o’clock.»' }
      ]
    },
    {
      id: 'sleep', voices: { N: 'm' }, title: 'Teenagers and sleep', kind: 'Radiobeitrag',
      lines: [
        ['N', 'Scientists say that teenagers need between eight and ten hours of sleep every night. But a new study shows that most teenagers sleep only about seven hours on school nights.'],
        ['N', 'One of the main reasons is the smartphone. Many young people use their phones in bed, and the blue light from the screen makes it harder to fall asleep.'],
        ['N', 'Not getting enough sleep can have serious effects. Students who sleep too little often find it difficult to concentrate, and their marks at school can get worse.'],
        ['N', 'So what can you do? Experts recommend switching off your phone at least one hour before going to bed, and leaving it outside your bedroom. Going to bed at the same time every day also helps – even at the weekend.']
      ],
      qs: [
        { type: 'mc', q: 'How much sleep do teenagers need according to scientists?', options: ['six to seven hours', 'seven to eight hours', 'eight to ten hours', 'more than ten hours'], answer: 2, explain: '«… teenagers need between eight and ten hours of sleep every night.»' },
        { type: 'number', unit: 'h', q: 'How many hours do most teenagers really sleep on school nights?', answer: 7, explain: '«… most teenagers sleep only about seven hours on school nights.»' },
        { type: 'mc', q: 'Why does the smartphone make it harder to fall asleep?', options: ['because of the noise', 'because of the blue light', 'because it is too heavy', 'because of the messages from school'], answer: 1, explain: '«… the blue light from the screen makes it harder to fall asleep.»' },
        { type: 'mc', q: 'What is a possible effect of too little sleep?', options: ['better marks', 'problems concentrating', 'more friends', 'less homework'], answer: 1, explain: '«… often find it difficult to concentrate, and their marks at school can get worse.»' },
        { type: 'mc', q: 'Which tip do the experts NOT give?', options: ['switch off the phone an hour before bed', 'leave the phone outside the bedroom', 'go to bed at the same time every day', 'drink a glass of warm milk'], answer: 3, explain: 'Warm milk is not mentioned.' }
      ]
    },
    {
      id: 'airport', voices: { N: 'f' }, title: 'Announcement at the airport', kind: 'Durchsage',
      lines: [
        ['N', 'Good morning, ladies and gentlemen. Swiss flight L X three one eight to London Heathrow is now ready for boarding at gate B twenty-two.'],
        ['N', 'We would like to invite passengers with small children and passengers who need special help to board first.'],
        ['N', 'Please have your boarding pass and your passport ready. Remember that each passenger may take only one piece of hand luggage on board.'],
        ['N', 'The gate will close at nine forty. Thank you.']
      ],
      qs: [
        { type: 'mc', q: 'Where is the flight going?', options: ['to Zurich', 'to London Heathrow', 'to Manchester', 'to Edinburgh'], answer: 1, explain: '«… flight L X three one eight to London Heathrow …»' },
        { type: 'text', q: 'Which gate is it? (e.g. A12)', answer: ['B22', 'B 22', 'gate B22', 'gate B 22'], explain: '«… at gate B twenty-two.»' },
        { type: 'mc', q: 'Who may board first?', options: ['business class passengers', 'passengers with small children', 'passengers with a lot of luggage', 'students'], answer: 1, explain: '«… passengers with small children and passengers who need special help to board first.»' },
        { type: 'number', q: 'How many pieces of hand luggage may each passenger take on board?', answer: 1, explain: '«… only one piece of hand luggage on board.»' },
        { type: 'mc', q: 'When will the gate close?', options: ['at 9:14', 'at 9:40', 'at 9:45', 'at 10:40'], answer: 1, explain: '«The gate will close at nine forty.»' }
      ]
    },
    {
      id: 'weekend', voices: { A: 'f', B: 'm' }, title: 'Plans for the weekend', kind: 'Dialog',
      lines: [
        ['A', 'Hey Tom, do you want to do something on Sunday?'],
        ['B', 'Sure. What about going to the cinema? The new superhero film is on.'],
        ['A', 'Hmm, I’ve already seen it. And the weather is supposed to be great. Why don’t we go hiking instead?'],
        ['B', 'Hiking? Okay, but not too far. I played football on Saturday, so my legs will be tired.'],
        ['A', 'No problem. There’s a nice walk around the lake. It only takes about two hours, and there’s a café at the end.'],
        ['B', 'That sounds perfect. When shall we meet?'],
        ['A', 'Let’s take the train at half past nine. I’ll bring sandwiches, and you bring something to drink.'],
        ['B', 'Deal. See you at the station!']
      ],
      qs: [
        { type: 'mc', q: 'Why doesn’t the girl want to go to the cinema?', options: ['It’s too expensive.', 'She has already seen the film.', 'She doesn’t like superhero films.', 'The cinema is closed.'], answer: 1, explain: '«I’ve already seen it.»' },
        { type: 'mc', q: 'Why does Tom not want to walk too far?', options: ['He is ill.', 'He played football on Saturday.', 'He has to work.', 'He doesn’t like hiking.'], answer: 1, explain: '«I played football on Saturday, so my legs will be tired.»' },
        { type: 'number', unit: 'h', q: 'How long does the walk around the lake take (in hours)?', answer: 2, explain: '«It only takes about two hours …»' },
        { type: 'mc', q: 'At what time will they take the train?', options: ['at 9:00', 'at 9:30', 'at 10:30', 'at 2:30'], answer: 1, explain: '«Let’s take the train at half past nine.»' },
        { type: 'mc', q: 'What will Tom bring?', options: ['sandwiches', 'something to drink', 'a map', 'cake'], answer: 1, explain: '«I’ll bring sandwiches, and you bring something to drink.»' }
      ]
    }
  ];

  // Thema «Listening» an Englisch anhängen
  en.topics.push({ id: 'listening', name: 'Listening', desc: 'Hörverständnis: Durchsagen, Dialoge, Interviews' });
  for (const a of AUDIO) {
    const audio = { id: a.id, title: a.title, kind: a.kind, lines: a.lines, voices: a.voices || {} };
    a.qs.forEach((q, k) => en.items.push(Object.assign({ id: `e-l-${a.id}-${k + 1}`, topic: 'listening', audio }, q)));
  }
  BMP.audioSets = AUDIO.map(a => a.id);
})(typeof window !== 'undefined' ? window : globalThis);
