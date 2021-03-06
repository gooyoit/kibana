/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { useMemo, useState } from 'react';
import {
  EuiAccordion,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
  EuiHorizontalRule,
  EuiSpacer,
  EuiSwitch,
  EuiText,
  EuiComboBox,
  EuiIconTip,
  EuiCheckboxGroup,
} from '@elastic/eui';
import { FormattedMessage } from '@kbn/i18n/react';
import { i18n } from '@kbn/i18n';
import styled from 'styled-components';
import { NewAgentConfig } from '../../../types';

interface ValidationResults {
  [key: string]: JSX.Element[];
}

const StyledEuiAccordion = styled(EuiAccordion)`
  .ingest-active-button {
    color: ${props => props.theme.eui.euiColorPrimary};
  }
`;

export const agentConfigFormValidation = (
  agentConfig: Partial<NewAgentConfig>
): ValidationResults => {
  const errors: ValidationResults = {};

  if (!agentConfig.name?.trim()) {
    errors.name = [
      <FormattedMessage
        id="xpack.ingestManager.agentConfigForm.nameRequiredErrorMessage"
        defaultMessage="Agent config name is required"
      />,
    ];
  }

  return errors;
};

interface Props {
  agentConfig: Partial<NewAgentConfig>;
  updateAgentConfig: (u: Partial<NewAgentConfig>) => void;
  withSysMonitoring: boolean;
  updateSysMonitoring: (newValue: boolean) => void;
  validation: ValidationResults;
}

export const AgentConfigForm: React.FunctionComponent<Props> = ({
  agentConfig,
  updateAgentConfig,
  withSysMonitoring,
  updateSysMonitoring,
  validation,
}) => {
  const [touchedFields, setTouchedFields] = useState<{ [key: string]: boolean }>({});
  const [showNamespace, setShowNamespace] = useState<boolean>(false);
  const fields: Array<{
    name: 'name' | 'description' | 'namespace';
    label: JSX.Element;
    placeholder: string;
  }> = useMemo(() => {
    return [
      {
        name: 'name',
        label: (
          <FormattedMessage
            id="xpack.ingestManager.agentConfigForm.nameFieldLabel"
            defaultMessage="Name"
          />
        ),
        placeholder: i18n.translate('xpack.ingestManager.agentConfigForm.nameFieldPlaceholder', {
          defaultMessage: 'Choose a name',
        }),
      },
      {
        name: 'description',
        label: (
          <FormattedMessage
            id="xpack.ingestManager.agentConfigForm.descriptionFieldLabel"
            defaultMessage="Description"
          />
        ),
        placeholder: i18n.translate(
          'xpack.ingestManager.agentConfigForm.descriptionFieldPlaceholder',
          {
            defaultMessage: 'How will this configuration be used?',
          }
        ),
      },
    ];
  }, []);

  return (
    <EuiForm>
      {fields.map(({ name, label, placeholder }) => {
        return (
          <EuiFormRow
            fullWidth
            key={name}
            label={label}
            error={touchedFields[name] && validation[name] ? validation[name] : null}
            isInvalid={Boolean(touchedFields[name] && validation[name])}
          >
            <EuiFieldText
              fullWidth
              value={agentConfig[name]}
              onChange={e => updateAgentConfig({ [name]: e.target.value })}
              isInvalid={Boolean(touchedFields[name] && validation[name])}
              onBlur={() => setTouchedFields({ ...touchedFields, [name]: true })}
              placeholder={placeholder}
            />
          </EuiFormRow>
        );
      })}
      <EuiFormRow
        label={
          <EuiText size="xs" color="subdued">
            <FormattedMessage
              id="xpack.ingestManager.agentConfigForm.systemMonitoringFieldLabel"
              defaultMessage="Optional"
            />
          </EuiText>
        }
      >
        <EuiSwitch
          showLabel={true}
          label={
            <>
              <FormattedMessage
                id="xpack.ingestManager.agentConfigForm.systemMonitoringText"
                defaultMessage="Collect system metrics"
              />{' '}
              <EuiIconTip
                content={i18n.translate(
                  'xpack.ingestManager.agentConfigForm.systemMonitoringTooltipText',
                  {
                    defaultMessage:
                      'Enable this option to bootstrap your configuration with a data source that collects system metrics and information.',
                  }
                )}
                position="right"
                type="iInCircle"
              />
            </>
          }
          checked={withSysMonitoring}
          onChange={() => {
            updateSysMonitoring(!withSysMonitoring);
          }}
        />
      </EuiFormRow>
      <EuiHorizontalRule />
      <EuiSpacer size="xs" />
      <StyledEuiAccordion
        id="advancedOptions"
        buttonContent={
          <FormattedMessage
            id="xpack.ingestManager.agentConfigForm.advancedOptionsToggleLabel"
            defaultMessage="Advanced options"
          />
        }
        buttonClassName="ingest-active-button"
      >
        <EuiSpacer size="l" />
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiText>
              <h4>
                <FormattedMessage
                  id="xpack.ingestManager.agentConfigForm.namespaceFieldLabel"
                  defaultMessage="Default namespace"
                />
              </h4>
            </EuiText>
            <EuiSpacer size="m" />
            <EuiText size="s">
              <FormattedMessage
                id="xpack.ingestManager.agentConfigForm.namespaceFieldDescription"
                defaultMessage="Apply a default namespace to data sources that use this configuration. Data sources can specify their own namespaces."
              />
            </EuiText>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiSwitch
              showLabel={true}
              label={
                <FormattedMessage
                  id="xpack.ingestManager.agentConfigForm.namespaceUseDefaultsFieldLabel"
                  defaultMessage="Use default namespace"
                />
              }
              checked={showNamespace}
              onChange={() => {
                setShowNamespace(!showNamespace);
                if (showNamespace) {
                  updateAgentConfig({ namespace: '' });
                }
              }}
            />
            {showNamespace && (
              <>
                <EuiSpacer size="m" />
                <EuiFormRow
                  fullWidth
                  error={
                    touchedFields.namespace && validation.namespace ? validation.namespace : null
                  }
                  isInvalid={Boolean(touchedFields.namespace && validation.namespace)}
                >
                  <EuiComboBox
                    fullWidth
                    singleSelection
                    noSuggestions
                    selectedOptions={
                      agentConfig.namespace ? [{ label: agentConfig.namespace }] : []
                    }
                    onCreateOption={(value: string) => {
                      updateAgentConfig({ namespace: value });
                    }}
                    onChange={selectedOptions => {
                      updateAgentConfig({
                        namespace: (selectedOptions.length ? selectedOptions[0] : '') as string,
                      });
                    }}
                    isInvalid={Boolean(touchedFields.namespace && validation.namespace)}
                    onBlur={() => setTouchedFields({ ...touchedFields, namespace: true })}
                  />
                </EuiFormRow>
              </>
            )}
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer size="m" />
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiText>
              <h4>
                <FormattedMessage
                  id="xpack.ingestManager.agentConfigForm.monitoringLabel"
                  defaultMessage="Agent monitoring"
                />
              </h4>
            </EuiText>
            <EuiSpacer size="m" />
            <EuiText size="s">
              <FormattedMessage
                id="xpack.ingestManager.agentConfigForm.monitoringDescription"
                defaultMessage="Collect data about your agents for debugging and tracking performance."
              />
            </EuiText>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiCheckboxGroup
              options={[
                {
                  id: 'logs',
                  label: i18n.translate(
                    'xpack.ingestManager.agentConfigForm.monitoringLogsFieldLabel',
                    { defaultMessage: 'Collect agent logs' }
                  ),
                },
                {
                  id: 'metrics',
                  label: i18n.translate(
                    'xpack.ingestManager.agentConfigForm.monitoringMetricsFieldLabel',
                    { defaultMessage: 'Collect agent metrics' }
                  ),
                },
              ]}
              idToSelectedMap={(agentConfig.monitoring_enabled || []).reduce(
                (acc: { logs: boolean; metrics: boolean }, key) => {
                  acc[key] = true;
                  return acc;
                },
                { logs: false, metrics: false }
              )}
              onChange={id => {
                if (id !== 'logs' && id !== 'metrics') {
                  return;
                }

                const hasLogs =
                  agentConfig.monitoring_enabled && agentConfig.monitoring_enabled.indexOf(id) >= 0;

                const previousValues = agentConfig.monitoring_enabled || [];
                updateAgentConfig({
                  monitoring_enabled: hasLogs
                    ? previousValues.filter(type => type !== id)
                    : [...previousValues, id],
                });
              }}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      </StyledEuiAccordion>
    </EuiForm>
  );
};
