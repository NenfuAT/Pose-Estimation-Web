import React, { useState } from "react";
import styles from "./style.module.scss"
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
      className={styles.container}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button className={styles.mainButton}>{tabName}</button>
      {isHovered && (
        <div className={styles.dropdown}>
          {buttonConfigs.map((buttonConfig) => (
            <button
              key={buttonConfig.title}
              onClick={buttonConfig.onClick}
              className={styles.dropdownButton}
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
