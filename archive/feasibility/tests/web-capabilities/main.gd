extends Control
# Exercises real upstream French assets and SQLite WASM, without accounts/game changes.

var database: SQLite
var player: AudioStreamPlayer

func require(condition: bool, message: String) -> bool:
	if not condition:
		push_error("CAPABILITY_FAIL: " + message)
	return condition

func _ready() -> void:
	var persistent: bool = FileAccess.file_exists("user://probe-marker.txt")
	print("CAPABILITY_STORAGE_PREVIOUS: " + str(persistent))
	var marker := FileAccess.open("user://probe-marker.txt", FileAccess.WRITE)
	if not require(marker != null, "user filesystem write"):
		return
	marker.store_string("kalulu-capability-probe")
	marker.close()
	if not FileAccess.file_exists("user://language.db"):
		var target := FileAccess.open("user://language.db", FileAccess.WRITE)
		target.store_buffer(FileAccess.get_file_as_bytes("res://language.db"))
		target.close()
	database = SQLite.new()
	database.path = "user://language.db"
	if not require(database.open_db(), "open actual French language database"):
		return
	if not require(database.query("SELECT COUNT(*) AS count FROM GPs"), "French GPs query"):
		return
	if not require(database.query_result[0]["count"] == 118, "expected 118 French grapheme entries"):
		return
	if not require(database.query("SELECT COUNT(*) AS count FROM Lessons"), "French lessons query"):
		return
	if not require(database.query_result[0]["count"] == 60, "expected 60 French lessons"):
		return
	if not require(database.query("CREATE TABLE IF NOT EXISTS FeasibilityState (value TEXT)"), "SQLite write"):
		return
	if persistent:
		if not require(database.query("SELECT value FROM FeasibilityState"), "SQLite persistence query"):
			return
		if not require(not database.query_result.is_empty() and database.query_result[0]["value"] == "persisted", "SQLite state persisted across reload"):
			return
	else:
		if not require(database.query("INSERT INTO FeasibilityState VALUES ('persisted')"), "SQLite insert"):
			return
	database.close_db()
	print("CAPABILITY_SQLITE_PASS: 118 graphemes, 60 lessons, writable database")
	var audio_file := FileAccess.open("user://speech.bin", FileAccess.WRITE)
	audio_file.store_buffer(FileAccess.get_file_as_bytes("res://speech.bin"))
	audio_file.close()
	var stream := AudioStreamMP3.new()
	stream.data = FileAccess.get_file_as_bytes("user://speech.bin")
	if not require(stream.get_length() > 0, "French MP3 decodes from user filesystem"):
		return
	print("CAPABILITY_MP3_DECODE_PASS: duration=" + str(stream.get_length()))
	player = AudioStreamPlayer.new()
	player.stream = stream
	add_child(player)
	player.finished.connect(func(): print("CAPABILITY_AUDIO_FINISHED"))
	var button := Button.new()
	button.text = "Play original French speech"
	button.position = Vector2(80, 80)
	button.size = Vector2(640, 120)
	button.pressed.connect(func():
		player.play()
		print("CAPABILITY_AUDIO_STARTED")
	)
	add_child(button)
	print("CAPABILITY_READY")
