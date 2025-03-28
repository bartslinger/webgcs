// class with private number property

class AppState {
	private _count = $state(0);

	get count() {
		return this._count;
	}

	increment() {
		this._count += 1;
	}

	decrement() {
		this._count -= 1;
	}
}

export const app_state = new AppState();
