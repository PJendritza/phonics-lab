extends Control

func label_in(box: Control, text: String, font_size: int) -> Label:
	var label := Label.new()
	label.text = text
	label.add_theme_font_size_override("font_size", font_size)
	label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	box.add_child(label)
	return label

func button_in(box: Control, text: String, action: Callable, width: float = 700.0, height: float = 150.0) -> Button:
	var button := Button.new()
	button.text = text
	button.custom_minimum_size = Vector2(width, height)
	button.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	button.add_theme_font_size_override("font_size", 60)
	button.pressed.connect(action)
	box.add_child(button)
	return button

func row_in(box: Control) -> HBoxContainer:
	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 25)
	box.add_child(row)
	return row

func _ready() -> void:
	OpeningCurtain.open()
	var background := ColorRect.new()
	background.color = Color("#2d397e")
	background.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	background.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(background)
	var box := VBoxContainer.new()
	box.position = Vector2(130, 100)
	box.size = Vector2(2300, 1600)
	box.add_theme_constant_override("separation", 35)
	add_child(box)
	label_in(box, "Kalulu · Deutsch ausprobieren", 95)
	var lessons := row_in(box)
	for number in range(1, 7):
		var text: String = str(number) + " · " + ["a m", "i", "o", "l", "n", "u"][number - 1]
		var button := button_in(lessons, text, Demo.select_lesson.bind(number), 360, 145)
		if number == Demo.selected_lesson:
			button.modulate = Color("#ffdf85")
	var lesson: Dictionary = Demo.content["lessons"][Demo.selected_lesson - 1]
	label_in(box, "Lektion %d: %s" % [Demo.selected_lesson, lesson["title"]], 78)
	label_in(box, lesson["explanation"], 53)
	label_in(box, "Neue Laute anhören", 60)
	var sounds := row_in(box)
	for key in lesson["new_gps"]:
		for gp in Demo.content["gps"]:
			if gp["id"] != key:
				continue
			var qualifier := ""
			if key.ends_with("_long"):
				qualifier = " lang"
			elif key.ends_with("_short"):
				qualifier = " kurz"
			elif key.ends_with("_unstressed"):
				qualifier = " unbetont"
			button_in(sounds, gp["grapheme"] + qualifier + " · hören", Demo.hear_gp.bind(key))
	var syllables: Array[String] = []
	for item in lesson["syllables"]:
		syllables.append(item["text"])
	label_in(box, "Silben und Lautübungen: " + " · ".join(syllables), 56)
	var words: Array[String] = []
	for item in lesson["words"]:
		words.append(item["text"] + (" (Name)" if item["word_kind"] == "proper_name" else ""))
	label_in(box, "Neue Wörter: " + " · ".join(words), 56)
	var games := row_in(box)
	for game in ["jellyfish", "frog"]:
		var text := "Silben hören · Quallen" if game == "jellyfish" else "Wörter lesen · Frosch"
		if str(Demo.selected_lesson) + ":" + game in Demo.completed:
			text += " ✓"
		button_in(games, text, Demo.play.bind(game), 1100, 190)
	label_in(box, Demo.last_result + "\nÜbe auch schon bekannte Laute und Wörter. Ton einschalten!", 48)
	label_in(box, "Testfassung für Erwachsene · künstliche Stimme · Aussprache noch prüfen", 43)
	print("GERMAN_MENU lesson=%d completed=%d" % [Demo.selected_lesson, Demo.completed.size()])
