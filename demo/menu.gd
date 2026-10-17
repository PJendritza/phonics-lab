extends Control

func _ready() -> void:
	OpeningCurtain.open()
	var background := ColorRect.new()
	background.color = Color("#2d397e")
	background.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	background.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(background)
	var box := VBoxContainer.new()
	box.set_anchors_and_offsets_preset(Control.PRESET_TOP_LEFT)
	box.position = Vector2(280, 280)
	box.size = Vector2(2000, 1200)
	box.add_theme_constant_override("separation", 60)
	add_child(box)
	var title := Label.new()
	title.text = "Kalulu — Démo française"
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.add_theme_font_size_override("font_size", 100)
	box.add_child(title)
	var description := Label.new()
	description.text = "Écoute le son, puis touche la bonne méduse.\nActive le son de ton téléphone."
	description.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	description.add_theme_font_size_override("font_size", 65)
	box.add_child(description)
	for item in [[1, "Jouer : le son a"], [2, "Jouer : les sons a et e"]]:
		var button := Button.new()
		button.text = item[1]
		button.custom_minimum_size = Vector2(1800, 190)
		button.add_theme_font_size_override("font_size", 75)
		button.pressed.connect(Demo.play.bind(int(item[0])))
		box.add_child(button)
	var note := Label.new()
	note.text = Demo.last_result + "\nDémo locale : aucun compte, aucune donnée envoyée."
	note.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	note.add_theme_font_size_override("font_size", 50)
	box.add_child(note)
	print("DEMO_MENU")
