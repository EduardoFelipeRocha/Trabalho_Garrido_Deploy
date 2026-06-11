Feature: Registro de chamados urbanos
  Como cidadao
  Quero registrar um problema urbano
  Para que a prefeitura possa priorizar e acompanhar o atendimento

  Scenario: Chamado urgente perto de escola
    Given a categoria "pothole" com severidade 4
    When o cidadao registra "Buraco com risco de acidente perto da escola"
    Then o chamado deve ser criado com prioridade 5
    And uma notificacao deve ser publicada

  Scenario: Chamado comum de iluminacao
    Given a categoria "lighting" com severidade 3
    When o cidadao registra "Lampada apagada na rua"
    Then o chamado deve ser criado com prioridade 3
    And uma notificacao deve ser publicada
