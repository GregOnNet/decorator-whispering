import { ClassDeclaration, Node, Project, StructureKind } from 'ts-morph';

// reference: ts-morph API: https://ts-morph.com/details/index
// process entity.ts
// read class name
// - add property "name" to @Rule decorator
// read public properties
// - add property "types" to @Rule decorator
// read oss-url from @Rule decorator
// - read oss file
// - add property "oss" inlining the content of oss file

const project = new Project();
const sourceFile = project.createSourceFile(
  'entity.ts',
  `
    class EntityB {}
    
    @Rule({
      ossUrls: ['./entity.oss']
    })
    export class Entity {
        aString: string;
        aNumber: number;
        aBoolean: boolean;
        aDate: Date;
        aCustomClass: EntityB;
    }
  `
);

console.log('BEFORE');
console.log('-----');
console.log(sourceFile.getText());

const classesInFile = sourceFile.getClasses();
const ruleClasses = classesInFile.filter(clazz => isRule(clazz));

ruleClasses.forEach(clazz => {
  const ruleDecorator = clazz.getDecorator('Rule');

  if (!ruleDecorator) return;

  const ruleSettings =
    ruleDecorator.getArguments()[0] || ruleDecorator.addArgument('{}');

  if (Node.isObjectLiteralExpression(ruleSettings)) {
    ruleSettings.addProperty({
      kind: StructureKind.PropertyAssignment,
      name: 'name',
      initializer: JSON.stringify(clazz.getName())
    });

    ruleSettings.addProperty({
      kind: StructureKind.PropertyAssignment,
      name: 'types',
      initializer: JSON.stringify(getPropertiesFromClass(clazz))
    });
  }
});

console.log('AFTER');
console.log('-----');
console.log(sourceFile.getText());

function getPropertiesFromClass(clazz: ClassDeclaration) {
  return clazz
    .getProperties()
    .map(prop => {
      if (!prop.getType().isClass()) {
        return {
          name: prop.getName(),
          type: capitalize(prop.getType().getText())
        };
      } else {
        return { name: prop.getName(), type: prop.getType().getText() };
      }
    })
    .reduce(
      (dictionary, prop) => ({ ...dictionary, [prop.name]: prop.type }),
      {}
    );
}

function isRule(clazz: ClassDeclaration) {
  return clazz
    .getDecorators()
    .some(decorator => decorator.getFullName() === 'Rule');
}

function capitalize(text: string): string {
  return text.replace(/^\w/, char => char.toUpperCase());
}
