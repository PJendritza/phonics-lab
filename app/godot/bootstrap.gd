extends Node
# Local German prototype. No production login, synchronization or analytics.
const MENU = "res://demo/menu.tscn"
const GAMES = {
	"jellyfish": "res://sources/minigames/jellyfish/jellyfish_minigame.tscn",
	"frog": "res://sources/minigames/frog/frog_minigame.tscn",
}
var ready_for_play := false
var content: Dictionary = {}
var selected_lesson := 1
var active_game := ""
var last_result := ""
var completed: Array = []
var progress := ConfigFile.new()
var preview := AudioStreamPlayer.new()

func _ready() -> void:
	UserDataManager.stop_synchronization_timer()
	UserDataManager.set_process(false)
	ServerManager.set_process(false)
	var manifest = JSON.parse_string(FileAccess.get_file_as_string("res://demo/pack/manifest.json"))
	for entry in manifest:
		var target: String = "user://language_resources/de_DE/" + entry["path"]
		DirAccess.make_dir_recursive_absolute(target.get_base_dir())
		var data = FileAccess.get_file_as_bytes("res://demo/pack/" + entry["file"])
		if FileAccess.get_file_as_bytes(target) != data:
			var output = FileAccess.open(target, FileAccess.WRITE)
			output.store_buffer(data)
			output.close()
	content = JSON.parse_string(FileAccess.get_file_as_string("res://demo/content.json"))
	Database.language = "de_DE"
	Database.connect_to_db()
	if not Database.is_open:
		push_error("GERMAN: database could not open")
		return
	var settings = UserDataManager.get_device_settings()
	settings.teacher = "offline-german-prototype"
	settings.device_id = 1
	settings.language = "de_DE"
	var teacher = TeacherSettings.new()
	teacher.language = "de_DE"
	UserDataManager.teacher_settings = teacher
	UserDataManager.student = "987"
	TranslationServer.set_locale("de_DE")
	progress.load("user://german_demo_progress.cfg")
	completed = progress.get_value("progress", "completed", [])
	selected_lesson = clampi(int(progress.get_value("progress", "lesson", 1)), 1, 6)
	add_child(preview)
	ready_for_play = true
	print("GERMAN_READY: six German lessons, offline, synthetic draft speech")

func save_progress() -> void:
	progress.set_value("progress", "completed", completed)
	progress.set_value("progress", "lesson", selected_lesson)
	if progress.save("user://german_demo_progress.cfg") != OK:
		push_warning("GERMAN: local progress could not be saved")

func select_lesson(number: int) -> void:
	selected_lesson = clampi(number, 1, 6)
	preview.stop()
	save_progress()
	get_tree().reload_current_scene()

func hear_gp(key: String) -> void:
	for gp in content["gps"]:
		if gp["id"] == key:
			var sound = Database.load_external_sound(Database.get_gp_sound_path({"Grapheme": gp["grapheme"], "Phoneme": gp["phoneme"]}))
			if sound:
				preview.stream = sound
				preview.play()
				print("GERMAN_PREVIEW " + key)
			return

func play(game: String) -> void:
	if not ready_for_play or not GAMES.has(game):
		return
	preview.stop()
	var exercise_id := 1 if game == "jellyfish" else 6
	var slot: int = Database.get_exercise_for_lesson(selected_lesson).find(exercise_id)
	if slot < 0:
		push_error("GERMAN: exercise missing from lesson")
		return
	Minigame.transition_data = {"current_lesson_number": selected_lesson, "minigame_number": slot}
	active_game = game
	last_result = ""
	get_tree().change_scene_to_file(GAMES[game])

func home(finished: bool) -> void:
	get_tree().paused = false
	if finished:
		var key := str(selected_lesson) + ":" + active_game
		if key not in completed:
			completed.append(key)
		save_progress()
		last_result = "Geschafft! Wähle eine weitere Übung."
		print("GERMAN_COMPLETE lesson=%d game=%s" % [selected_lesson, active_game])
	else:
		last_result = "Wähle eine Übung."
		print("GERMAN_HOME")
	get_tree().change_scene_to_file(MENU)
