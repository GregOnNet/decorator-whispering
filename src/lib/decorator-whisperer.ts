// reference: ts-morph API: https://ts-morph.com/details/index
// process entity.ts
// read class name
// - add property "name" to @Rule decorator
// read public properties
// - add property "types" to @Rule decorator
// read oss-url from @Rule decorator
// - read oss file
// - add property "oss" inlining the content of oss file
import { ClassDeclaration, Project } from 'ts-morph';

const project = new Project();
const sourceFile = project.createSourceFile(
  'entity.ts',
  `
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

const classesInFile = sourceFile.getClasses();
const ruleClasses = classesInFile.filter(clazz => isRule(clazz));

function isRule(clazz: ClassDeclaration) {
  return clazz
    .getDecorators()
    .some(decorator => decorator.getFullName() === 'Rule');
}
