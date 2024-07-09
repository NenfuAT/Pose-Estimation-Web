import React, { Dispatch, SetStateAction, useState } from "react";
import "./MenuBar.css";
import { ButtonConfig } from "@/types";

type Props = {
  tabName: string;
  buttonConfigs: ButtonConfig[];
};

const MenuBar = ({ tabName, buttonConfigs }: Props) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div
      className="container"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button className="main-button">{tabName}</button>
      {isHovered && (
        <div className="dropdown">
          {buttonConfigs.map((buttonConfig) => (
            <button
              key={buttonConfig.title}
              onClick={buttonConfig.onClick}
              className="dropdown-button"
            >
              {buttonConfig.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MenuBar;
