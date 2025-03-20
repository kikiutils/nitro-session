export type IfElse<
    Condition,
    ReferenceCondition,
    Then,
    Else,
> = Condition extends ReferenceCondition ? Then : Else;
