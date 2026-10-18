extends Node
# Local demo bootstrap only. Never logs in or creates a production account.
const MENU = "res://demo/menu.tscn"
const GAME = "res://sources/minigames/jellyfish/jellyfish_minigame.tscn"
var ready_for_play := false
var last_result := ""

func _ready() -> void:
	UserDataManager.stop_synchronization_timer()
	UserDataManager.set_process(false)
	ServerManager.set_process(false)
	var manifest = JSON.parse_string(FileAccess.get_file_as_string("res://demo/pack/manifest.json"))
	for entry in manifest:
		var target: String = "user://language_resources/fr_FR/" + entry["path"]
		DirAccess.make_dir_recursive_absolute(target.get_base_dir())
		var data = FileAccess.get_file_as_bytes("res://demo/pack/" + entry["file"])
		if FileAccess.get_file_as_bytes(target) != data:
			var output = FileAccess.open(target, FileAccess.WRITE)
			output.store_buffer(data)
			output.close()
	Database.language = "fr_FR"
	Database.connect_to_db()
	if not Database.is_open:
		push_error("DEMO: French database could not open")
		return
	var settings = UserDataManager.get_device_settings()
	settings.teacher = "offline-demo"
	settings.device_id = 1
	settings.language = "fr_FR"
	var teacher = TeacherSettings.new()
	teacher.language = "fr_FR"
	UserDataManager.teacher_settings = teacher
	UserDataManager.student = "123"
	ready_for_play = true
	print("DEMO_READY: original French lessons, no account or network")

func play(lesson: int) -> void:
	if not ready_for_play:
		return
	var slot: int = Database.get_exercise_for_lesson(lesson).find(1)
	Minigame.transition_data = {"current_lesson_number": lesson, "minigame_number": slot}
	last_result = ""
	get_tree().change_scene_to_file(GAME)

func home(completed: bool) -> void:
	get_tree().paused = false
	last_result = "Bravo ! Tu as terminé cette activité." if completed else "Choisis une activité."
	print("DEMO_COMPLETE" if completed else "DEMO_HOME")
	get_tree().change_scene_to_file(MENU)
