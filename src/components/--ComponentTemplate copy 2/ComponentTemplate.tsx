import React from 'react';
import styles from './ComponentTemplate.module.scss';

export interface ComponentTemplateProps {
    anything?: string;
}

const ComponentTemplate: React.FC<ComponentTemplateProps> = () => {
    return (
        <div className={styles.anything} data-testid="ComponentTemplate">
            ----------
            <ol>
                <li>Copy/paste this template folder</li>
                <li>Rightclick folder and select `Find in folder`</li>
                <li>
                    Press Ctrl + Shift + H (replace all) and replace all instances of
                    `ComponentTemplate` with your new component name
                </li>
                <li>Change all file-names</li>
            </ol>
            ----------
        </div>
    );
};

export default ComponentTemplate;