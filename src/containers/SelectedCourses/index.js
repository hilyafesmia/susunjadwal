import React, { useContext } from "react";
import styled, { css } from "styled-components";

import GlobalContext from "contexts/GlobalContext";
import { isScheduleConflict } from "./utils";
import TrashIcon from "assets/trash.png";
import TrashWhiteIcon from "assets/trash-white.png";

function SelectedCourses() {
  const { schedules, removeSchedule } = useContext(GlobalContext);
  const totalCredits = schedules.reduce((prev, { credit }) => prev + credit, 0);

  let isConflict = false;
  const items = schedules.map(schedule => {
    const isCurrentScheduleConflict = isScheduleConflict(schedules, schedule);
    isConflict = isConflict || isCurrentScheduleConflict;

    const classesTimes = schedule.schedule_items.map((item, index) => (
      <span key={index}>
        - {item.day}, {item.start}-{item.end}
      </span>
    ));

    return (
      <TableContentRow inverted={isCurrentScheduleConflict}>
        <div className="courseName">{schedule.name}</div>
        <div>{classesTimes}</div>
        <div className="small-2 columns">{schedule.credit}</div>
        <div className="small-1 columns text-right">
          <DeleteButton
            className="removeButton"
            inverted={isCurrentScheduleConflict}
            onClick={() => removeSchedule(schedule)}
          />
        </div>
      </TableContentRow>
    );
  });

  return (
    <Container>
      <h3>Kelas Pilihan</h3>
      <TableHeader>
        <div>Kelas</div>
        <div>Waktu</div>
        <div>SKS</div>
      </TableHeader>
      {items}
      <TableCreditSum>
        <div>
          <span>Total SKS</span>
        </div>
        <div>{totalCredits}</div>
      </TableCreditSum>
      {isConflict && (
        <MessageContainer>
          <p>Ada konflik jadwal, perbaiki terlebih dahulu!</p>
        </MessageContainer>
      )}

      <button
        className="finishButton"
        //onClick={this.props.saveJadwal}
        disabled={isConflict || totalCredits > 24 || schedules.length === 0}
      >
        Simpan Jadwal
      </button>
    </Container>
  );
}

export default SelectedCourses;

const Container = styled.div`
  width: 100%;
  height: 100%;
  background-color: #222222;

  h3 {
    font-size: 1.5rem;
    color: #ce9d4d;
    font-weight: bold;
    margin-bottom: 16px;
  }
`;

const TableHeader = styled.div`
  display: flex;
  border-bottom: 2px solid #308077;
  font-weight: bold;

  div {
    padding: 0.5rem 0;
    &:nth-child(1) {
      flex: 4;
    }
    &:nth-child(2) {
      flex: 5;
    }
    &:nth-child(3) {
      flex: 3;
    }
  }
`;

const TableContentRow = styled.div`
  display: flex;
  font-size: 0.75rem;
  background-color: ${({ inverted }) => (inverted ? "#C74550" : "#0000")};

  div {
    padding: 0.5rem 0;
    display: flex;
    flex-direction: column;

    &:nth-child(1) {
      flex: 4;
    }
    &:nth-child(2) {
      flex: 5;
    }
    &:nth-child(3) {
      flex: 2;
      font-size: 16px;
    }
    &:nth-child(4) {
      flex: 1;
    }
  }
`;

const TableCreditSum = styled.div`
  display: flex;
  font-size: 16px;
  font-weight: bold;
  color: white;
  background-color: #308077;
  padding: 4px 12px;
  margin-top: 8px;

  div {
    &:nth-child(1) {
      flex: 9;
      display: flex;
      justify-content: flex-end;
      margin-right: 16px;
    }
    &:nth-child(2) {
      flex: 3;
    }
  }
`;
const DeleteButton = styled.button`
  background: url(${({ inverted }) => (inverted ? TrashWhiteIcon : TrashIcon)});
  background-size: contain;
  background-repeat: no-repeat;
  height: 100%;
  width: 80%;
  align-self: center;
`;

const MessageContainer = styled.div`
  background-color: #c74550;
  font-size: 0.75rem;
  padding: 4px;
  text-align: center;
`;