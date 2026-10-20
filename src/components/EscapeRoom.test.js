import { fireEvent, render, screen } from "@testing-library/react";
import EscapeRoom from "./EscapeRoom";
import { escapeGames } from "../data/gamesData";

function renderRoom(roomId) {
  const markRoomSolved = jest.fn();
  render(
    <EscapeRoom
      escapeGames={escapeGames}
      escapeGameId={105}
      roomId={roomId}
      goBack={jest.fn()}
      markRoomSolved={markRoomSolved}
    />
  );
  const room = escapeGames.find(game => game.id === 105).rooms.find(room => room.id === roomId);
  const input = screen.getByRole(room.type === "number" ? "spinbutton" : "textbox");
  return { input, markRoomSolved, room };
}

test.each([
  [6, "3588"],
  [6, "1485"],
  [8, "SP\u00d6KE"],
  [8, "  sp\u00f6kslott  "],
  [10, "1322"],
  [10, "4875"],
  [1, "02468"],
  [13, "  halloween  "],
])("accepts answer %s / %s and marks the room solved", (roomId, answer) => {
  const { input, markRoomSolved, room } = renderRoom(roomId);

  fireEvent.change(input, { target: { value: answer } });
  fireEvent.click(screen.getByRole("button", { name: "Kolla svar" }));

  expect(screen.getByText("R\u00e4tt!")).not.toBeNull();
  expect(screen.getByText(room.instruction)).not.toBeNull();
  expect(markRoomSolved).toHaveBeenCalledTimes(1);
  expect(markRoomSolved).toHaveBeenCalledWith(105, roomId);
});

test.each([
  [6, "9999"],
  [8, "SP\u00d6KE,SP\u00d6KSLOTT"],
  [8, "SP\u00d6K"],
  [10, ""],
  [1, "2468"],
])("rejects incorrect answer %s / %s", (roomId, answer) => {
  const { input, markRoomSolved } = renderRoom(roomId);

  fireEvent.change(input, { target: { value: answer } });
  fireEvent.click(screen.getByRole("button", { name: "Kolla svar" }));

  expect(screen.getByText("Fel, f\u00f6rs\u00f6k igen!")).not.toBeNull();
  expect(markRoomSolved).not.toHaveBeenCalled();
  expect(screen.queryByText("Instruktion:")).toBeNull();
});